"use server";

import { prisma } from "@/lib/prisma";
import { uploadImageToR2 } from "@/lib/storage";
import {
  atualizarStatusCastracaoSchema,
  castracaoSchema,
} from "@/schemas/castracao";
import {
  STATUS_SERVICO_CONFIG,
  gerarLinkWhatsappCastracao,
  sanitizarWhatsappE164,
} from "@/lib/castracao-labels";
import { requireAuth } from "@/lib/auth-checks";
import { revalidatePath } from "next/cache";
import {
  Especie,
  Sexo,
  StatusSolicitacaoServico,
  TipoServicoPet,
} from "@prisma/client";

export type CriarCastracaoResult = {
  success: boolean;
  protocolo?: string;
  error?: string;
};

export interface ProtocoloPublicoDTO {
  protocolo: string;
  primeiroNomeTutor: string;
  nomePet: string;
  especie: Especie;
  sexo: Sexo;
  pesoKg: number;
  municipio: string;
  tipoServico: TipoServicoPet;
  fotoPetUrl: string | null;
  status: StatusSolicitacaoServico;
  avisoStatus: string | null;
  dataAgendamento: string | null;
  localAtendimento: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ConsultaProtocoloResult = {
  success: boolean;
  dados?: ProtocoloPublicoDTO;
  error?: string;
};

export type AtualizarStatusCastracaoResult = {
  success: boolean;
  whatsappUrl?: string;
  avisoAplicado?: string;
  error?: string;
};

async function gerarProtocoloUnicoCastracao(): Promise<string> {
  const ano = new Date().getFullYear();

  for (let tentativa = 0; tentativa < 6; tentativa++) {
    const codigo = Math.floor(1000 + Math.random() * 9000);
    const candidato = `CAS-${ano}-${codigo}`;
    const existente = await prisma.solicitacaoCastracao.findUnique({
      where: { protocolo: candidato },
      select: { id: true },
    });
    if (!existente) return candidato;
  }

  return `CAS-${ano}-${Date.now().toString().slice(-5)}`;
}

/**
 * Server Action pública para cadastrar solicitação de castração/vacinação de animal.
 */
export async function criarSolicitacaoCastracao(
  formData: FormData
): Promise<CriarCastracaoResult> {
  try {
    const pesoRaw = String(formData.get("pesoKg") || "").replace(",", ".").trim();
    const pesoParsed = pesoRaw ? Number(pesoRaw) : NaN;

    const rawData = {
      tipoServico: formData.get("tipoServico") as TipoServicoPet,
      nomeTutor: formData.get("nomeTutor") as string,
      whatsapp: formData.get("whatsapp") as string,
      aceitouTermosLGPD: formData.get("aceitouTermosLGPD") === "true",
      endereco: formData.get("endereco") as string,
      bairro: formData.get("bairro") as string,
      municipio: formData.get("municipio") as string,
      nomePet: formData.get("nomePet") as string,
      especie: formData.get("especie") as Especie,
      sexo: formData.get("sexo") as Sexo,
      pesoKg: pesoParsed,
      idadeEstimada: (formData.get("idadeEstimada") as string) || undefined,
      observacoesSaude: (formData.get("observacoesSaude") as string) || undefined,
    };

    const validated = castracaoSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Dados inválidos no formulário.",
      };
    }

    const payload = validated.data;
    const wppE164 = sanitizarWhatsappE164(payload.whatsapp);

    if (wppE164.replace(/^55/, "").length < 10) {
      return {
        success: false,
        error: "WhatsApp inválido. Informe o DDD e o número completo.",
      };
    }

    const fotoFile = formData.get("fotoPet") as File | null;
    if (!fotoFile || fotoFile.size === 0) {
      return {
        success: false,
        error: "Por favor, anexe uma foto nítida do animal.",
      };
    }

    if (!fotoFile.type.startsWith("image/")) {
      return {
        success: false,
        error: "O arquivo anexado deve ser uma imagem válida (JPG, PNG ou WebP).",
      };
    }

    if (fotoFile.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: "A foto do animal deve ter no máximo 10 MB.",
      };
    }

    let fotoPetUrl: string;
    let fotoPetKey: string;
    try {
      const buffer = Buffer.from(await fotoFile.arrayBuffer());
      const uploadRes = await uploadImageToR2(buffer, "castracoes", fotoFile.name);
      fotoPetUrl = uploadRes.url;
      fotoPetKey = uploadRes.keyStorage;
    } catch (uploadErr) {
      console.error("[CASTRACAO_FOTO_UPLOAD_ERROR]", uploadErr);
      return {
        success: false,
        error: "Não foi possível processar a foto do animal. Tente outra imagem.",
      };
    }

    const protocolo = await gerarProtocoloUnicoCastracao();

    await prisma.solicitacaoCastracao.create({
      data: {
        protocolo,
        nomeTutor: payload.nomeTutor,
        whatsapp: wppE164,
        aceitouTermosLGPD: true,
        endereco: payload.endereco,
        bairro: payload.bairro,
        municipio: payload.municipio,
        nomePet: payload.nomePet,
        especie: payload.especie,
        sexo: payload.sexo,
        pesoKg: payload.pesoKg,
        idadeEstimada: payload.idadeEstimada || null,
        tipoServico: payload.tipoServico,
        fotoPetUrl,
        fotoPetKey,
        observacoesSaude: payload.observacoesSaude || null,
        status: StatusSolicitacaoServico.REGISTRADO,
        avisoStatus: STATUS_SERVICO_CONFIG.REGISTRADO.avisoPadrao,
      },
    });

    revalidatePath("/castracao");
    revalidatePath("/dashboard/castracoes");
    revalidatePath("/dashboard");

    return {
      success: true,
      protocolo,
    };
  } catch (error) {
    console.error("[ERRO_CRIAR_CASTRACAO]", error);
    return {
      success: false,
      error: "Não foi possível registrar a solicitação. Tente novamente.",
    };
  }
}

/**
 * Server Action pública para consultar o andamento e aviso de status pelo protocolo.
 */
export async function consultarProtocoloCastracao(
  protocoloRaw: string
): Promise<ConsultaProtocoloResult> {
  try {
    const protocolo = protocoloRaw.trim().toUpperCase();
    if (!protocolo || protocolo.length < 5) {
      return {
        success: false,
        error: "Informe um código de protocolo válido (ex: CAS-2026-4812).",
      };
    }

    const registro = await prisma.solicitacaoCastracao.findUnique({
      where: { protocolo },
      select: {
        protocolo: true,
        nomeTutor: true,
        nomePet: true,
        especie: true,
        sexo: true,
        pesoKg: true,
        municipio: true,
        tipoServico: true,
        fotoPetUrl: true,
        status: true,
        avisoStatus: true,
        dataAgendamento: true,
        localAtendimento: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!registro) {
      return {
        success: false,
        error:
          "Protocolo não encontrado. Confira se digitou o código completo exatamente como recebido.",
      };
    }

    const primeiroNome = registro.nomeTutor.trim().split(/\s+/)[0] || "Tutor";

    return {
      success: true,
      dados: {
        protocolo: registro.protocolo,
        primeiroNomeTutor: primeiroNome,
        nomePet: registro.nomePet,
        especie: registro.especie,
        sexo: registro.sexo,
        pesoKg: Number(registro.pesoKg),
        municipio: registro.municipio,
        tipoServico: registro.tipoServico,
        fotoPetUrl: registro.fotoPetUrl,
        status: registro.status,
        avisoStatus: registro.avisoStatus,
        dataAgendamento: registro.dataAgendamento
          ? registro.dataAgendamento.toISOString()
          : null,
        localAtendimento: registro.localAtendimento,
        createdAt: registro.createdAt.toISOString(),
        updatedAt: registro.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[ERRO_CONSULTAR_PROTOCOLO_CASTRACAO]", error);
    return {
      success: false,
      error: "Falha ao consultar o protocolo no momento.",
    };
  }
}

/**
 * Server Action protegida para a administradora atualizar o andamento e gerar
 * automaticamente o link de notificação pronta no WhatsApp do tutor.
 */
export async function atualizarStatusCastracao(params: {
  id: string;
  status: StatusSolicitacaoServico;
  avisoStatus?: string;
  dataAgendamento?: string | null;
  localAtendimento?: string | null;
}): Promise<AtualizarStatusCastracaoResult> {
  try {
    const user = await requireAuth();

    const validated = atualizarStatusCastracaoSchema.safeParse(params);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Dados de atualização inválidos.",
      };
    }

    const payload = validated.data;

    let dataAgendamentoDate: Date | null = null;
    if (payload.dataAgendamento) {
      const parsed = new Date(payload.dataAgendamento);
      if (!Number.isNaN(parsed.getTime())) {
        dataAgendamentoDate = parsed;
      }
    }

    const avisoFinal =
      payload.avisoStatus?.trim() ||
      STATUS_SERVICO_CONFIG[payload.status].avisoPadrao;

    const atualizado = await prisma.solicitacaoCastracao.update({
      where: { id: payload.id },
      data: {
        status: payload.status,
        avisoStatus: avisoFinal,
        dataAgendamento: dataAgendamentoDate,
        localAtendimento: payload.localAtendimento?.trim() || null,
        avaliadoPorId: user.id,
      },
    });

    const whatsappUrl = gerarLinkWhatsappCastracao(atualizado.whatsapp, {
      nomeTutor: atualizado.nomeTutor,
      nomePet: atualizado.nomePet,
      protocolo: atualizado.protocolo,
      municipio: atualizado.municipio,
      tipoServico: atualizado.tipoServico,
      status: atualizado.status,
      avisoStatus: atualizado.avisoStatus,
      dataAgendamento: atualizado.dataAgendamento,
      localAtendimento: atualizado.localAtendimento,
    });

    revalidatePath("/dashboard/castracoes");
    revalidatePath("/dashboard");
    revalidatePath("/castracao");

    return {
      success: true,
      whatsappUrl,
      avisoAplicado: avisoFinal,
    };
  } catch (error) {
    console.error("[ERRO_ATUALIZAR_CASTRACAO]", error);
    return {
      success: false,
      error: "Falha ao atualizar o andamento do protocolo.",
    };
  }
}

