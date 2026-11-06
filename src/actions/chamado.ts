"use server";

import { prisma } from "@/lib/prisma";
import { chamadoSchema } from "@/schemas/chamado";
import { uploadImageToR2 } from "@/lib/storage";
import { notificarNovoChamado } from "@/lib/n8n";
import { revalidatePath } from "next/cache";
import { Especie, NivelUrgencia, StatusAcolhimento } from "@prisma/client";
import { requireAuth } from "@/lib/auth-checks";

export type CriarChamadoResult = {
  success: boolean;
  protocolo?: string;
  error?: string;
};

export async function criarChamadoAcolhimento(
  formData: FormData
): Promise<CriarChamadoResult> {
  try {
    // 1. Extração dos campos de texto do FormData
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
      latitude: formData.get("latitude") ? Number(formData.get("latitude")) : undefined,
      longitude: formData.get("longitude") ? Number(formData.get("longitude")) : undefined,
    };

    // 2. Validação Zod no Servidor
    const validated = chamadoSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Dados inválidos.",
      };
    }

    const payload = validated.data;

    // 3. Sanitização e Padronização do WhatsApp para E.164
    let wppFormatado = payload.whatsapp.replace(/\D/g, "");
    if (!wppFormatado.startsWith("55") && (wppFormatado.length === 10 || wppFormatado.length === 11)) {
      wppFormatado = `55${wppFormatado}`;
    }

    // 4. Processamento de Upload das Fotos para o Cloudflare R2
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

    // 5. Geração de Protocolo Único (ex: "RES-2026-4821")
    const anoAtual = new Date().getFullYear();
    const codigoAleatorio = Math.floor(1000 + Math.random() * 9000);
    const protocolo = `RES-${anoAtual}-${codigoAleatorio}`;

    // 6. Gravação da Ocorrência no Banco PostgreSQL na VPS
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
        latitude: payload.latitude ? payload.latitude : null,
        longitude: payload.longitude ? payload.longitude : null,
        fotosOcorrenciaUrls: fotosUrls,
        fotosOcorrenciaKeys: fotosKeys,
      },
    });

    // 7. Notificação Assíncrona no n8n (WhatsApp com Protocolo)
    notificarNovoChamado({
      protocolo,
      nomeSolicitante: payload.nomeSolicitante,
      whatsapp: wppFormatado,
      especie: payload.especie,
      nivelUrgencia: payload.nivelUrgencia,
      bairro: payload.bairro,
      cidade: payload.cidade,
    }).catch((err) => {
      console.error("[N8N_NOTIFICACAO_CHAMADO_ERRO]", err);
    });

    // 8. Revalidações de Cache
    revalidatePath("/chamados");
    revalidatePath("/dashboard/chamados");

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
 * Server Action protegida para voluntários/admins atualizarem
 * o andamento de um chamado de acolhimento (Defesa em Profundidade).
 */
export async function atualizarStatusChamado(params: {
  chamadoId: string;
  status: StatusAcolhimento;
  parecerONG?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();

    await prisma.chamadoAcolhimento.update({
      where: { id: params.chamadoId },
      data: {
        status: params.status,
        parecerONG: params.parecerONG || undefined,
        atendidoPorId: user.id,
      },
    });

    revalidatePath("/dashboard/chamados");
    return { success: true };
  } catch (error) {
    console.error("[ERRO_ATUALIZAR_STATUS_CHAMADO]", error);
    return {
      success: false,
      error: "Falha ao atualizar status do chamado.",
    };
  }
}
