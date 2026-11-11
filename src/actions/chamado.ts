"use server";

import { prisma } from "@/lib/prisma";
import { chamadoSchema } from "@/schemas/chamado";
import { uploadImageToR2 } from "@/lib/storage";
import { gerarLinkWhatsappChamado } from "@/lib/chamado-labels";
import { sanitizarWhatsappE164 } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { Especie, NivelUrgencia, StatusAcolhimento } from "@prisma/client";
import { requireAuth } from "@/lib/auth-checks";

export type CriarChamadoResult = {
  success: boolean;
  protocolo?: string;
  error?: string;
};

async function gerarProtocoloUnicoChamado(): Promise<string> {
  const anoAtual = new Date().getFullYear();

  for (let i = 0; i < 6; i++) {
    const codigoAleatorio = Math.floor(1000 + Math.random() * 9000);
    const candidato = `RES-${anoAtual}-${codigoAleatorio}`;
    const existe = await prisma.chamadoAcolhimento.findUnique({
      where: { protocolo: candidato },
      select: { id: true },
    });
    if (!existe) return candidato;
  }

  return `RES-${anoAtual}-${Date.now().toString().slice(-5)}`;
}

export async function criarChamadoAcolhimento(
  formData: FormData
): Promise<CriarChamadoResult> {
  try {
    const rawData = {
      nomeSolicitante: formData.get("nomeSolicitante") as string,
      whatsapp: formData.get("whatsapp") as string,
      podeDarLarTemporario: formData.get("podeDarLarTemporario") === "true",
      aceitouTermosLGPD: formData.get("aceitouTermosLGPD") === "true",
      especie: formData.get("especie") as Especie,
      nivelUrgencia: formData.get("nivelUrgencia") as NivelUrgencia,
      descricaoSituacao: formData.get("descricaoSituacao") as string,
      enderecoOcorrencia: formData.get("enderecoOcorrencia") as string,
      pontoReferencia: (formData.get("pontoReferencia") as string) || undefined,
      bairro: formData.get("bairro") as string,
      cidade: formData.get("cidade") as string,
      protocoloPrefeitura:
        (formData.get("protocoloPrefeitura") as string) || undefined,
      latitude: formData.get("latitude")
        ? Number(formData.get("latitude"))
        : undefined,
      longitude: formData.get("longitude")
        ? Number(formData.get("longitude"))
        : undefined,
    };

    const validated = chamadoSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Dados inválidos.",
      };
    }

    const payload = validated.data;
    const wppFormatado = sanitizarWhatsappE164(payload.whatsapp);
    if (wppFormatado.replace(/^55/, "").length < 10) {
      return {
        success: false,
        error: "WhatsApp inválido. Informe DDD e número completo.",
      };
    }

    // Upload opcional das fotos da ocorrência para o Cloudflare R2
    const fotosFiles = formData.getAll("fotos") as File[];
    const fotosUrls: string[] = [];
    const fotosKeys: string[] = [];

    for (const file of fotosFiles) {
      if (file && file.size > 0 && file.type.startsWith("image/")) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const uploadRes = await uploadImageToR2(buffer, "chamados", file.name);
          fotosUrls.push(uploadRes.url);
          fotosKeys.push(uploadRes.keyStorage);
        } catch (uploadErr) {
          console.error("[CHAMADO_FOTO_UPLOAD_ERROR]", uploadErr);
        }
      }
    }

    const protocolo = await gerarProtocoloUnicoChamado();

    await prisma.chamadoAcolhimento.create({
      data: {
        protocolo,
        nomeSolicitante: payload.nomeSolicitante,
        whatsapp: wppFormatado,
        podeDarLarTemporario: payload.podeDarLarTemporario,
        aceitouTermosLGPD: true,
        especie: payload.especie,
        nivelUrgencia: payload.nivelUrgencia,
        descricaoSituacao: payload.descricaoSituacao,
        enderecoOcorrencia: payload.enderecoOcorrencia,
        pontoReferencia: payload.pontoReferencia || null,
        bairro: payload.bairro,
        cidade: payload.cidade,
        protocoloPrefeitura: payload.protocoloPrefeitura || null,
        latitude: payload.latitude ? payload.latitude : null,
        longitude: payload.longitude ? payload.longitude : null,
        fotosOcorrenciaUrls: fotosUrls,
        fotosOcorrenciaKeys: fotosKeys,
      },
    });

    revalidatePath("/chamados");
    revalidatePath("/dashboard/chamados");
    revalidatePath("/dashboard");

    return {
      success: true,
      protocolo,
    };
  } catch (error) {
    console.error("[ERRO_CRIAR_CHAMADO]", error);
    return {
      success: false,
      error: "Ocorreu um erro ao registrar o chamado. Por favor, tente novamente.",
    };
  }
}

/**
 * Server Action protegida para atualizar o andamento de um chamado e gerar link wa.me direto.
 */
export async function atualizarStatusChamado(params: {
  chamadoId: string;
  status: StatusAcolhimento;
  parecerONG?: string;
}): Promise<{ success: boolean; whatsappUrl?: string; error?: string }> {
  try {
    const user = await requireAuth();

    const atualizado = await prisma.chamadoAcolhimento.update({
      where: { id: params.chamadoId },
      data: {
        status: params.status,
        parecerONG: params.parecerONG?.trim() || null,
        atendidoPorId: user.id,
      },
    });

    const whatsappUrl = gerarLinkWhatsappChamado(atualizado.whatsapp, {
      nomeSolicitante: atualizado.nomeSolicitante,
      protocolo: atualizado.protocolo,
      cidade: atualizado.cidade,
      status: atualizado.status,
      parecerONG: atualizado.parecerONG,
    });

    revalidatePath("/dashboard/chamados");
    revalidatePath("/dashboard");
    return { success: true, whatsappUrl };
  } catch (error) {
    console.error("[ERRO_ATUALIZAR_STATUS_CHAMADO]", error);
    return {
      success: false,
      error: "Falha ao atualizar status do chamado.",
    };
  }
}
