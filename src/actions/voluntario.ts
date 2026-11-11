"use server";

import { prisma } from "@/lib/prisma";
import {
  atualizarStatusVoluntarioSchema,
  voluntarioInscricaoSchema,
} from "@/schemas/voluntario";
import { gerarLinkWhatsappVoluntario } from "@/lib/voluntario-labels";
import { sanitizarWhatsappE164 } from "@/lib/utils";
import { requireAuth } from "@/lib/auth-checks";
import { revalidatePath } from "next/cache";
import type { ModalidadeVoluntariado, StatusVoluntario } from "@prisma/client";

export type CriarVoluntarioResult = {
  success: boolean;
  protocolo?: string;
  error?: string;
};

export type AtualizarStatusVoluntarioResult = {
  success: boolean;
  whatsappUrl?: string;
  error?: string;
};

async function gerarProtocoloUnicoVoluntario(): Promise<string> {
  const ano = new Date().getFullYear();

  for (let i = 0; i < 6; i++) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const candidato = `VOL-${ano}-${num}`;
    const existe = await prisma.voluntarioInscricao.findUnique({
      where: { protocolo: candidato },
      select: { id: true },
    });
    if (!existe) return candidato;
  }

  return `VOL-${ano}-${Date.now().toString().slice(-5)}`;
}

/**
 * Server Action pública para registrar inscrição de voluntário (passeios, lar temporário ou personalizado).
 */
export async function criarVoluntarioInscricao(
  formData: FormData
): Promise<CriarVoluntarioResult> {
  try {
    const rawData = {
      modalidade: formData.get("modalidade") as ModalidadeVoluntariado,
      nome: formData.get("nome") as string,
      whatsapp: formData.get("whatsapp") as string,
      municipio: formData.get("municipio") as string,
      disponibilidade: formData.get("disponibilidade") as string,
      descricao: formData.get("descricao") as string,
      aceitouTermosLGPD: formData.get("aceitouTermosLGPD") === "true",
    };

    const validated = voluntarioInscricaoSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message ||
          "Dados inválidos no cadastro de voluntário.",
      };
    }

    const payload = validated.data;
    const wppE164 = sanitizarWhatsappE164(payload.whatsapp);
    if (wppE164.replace(/^55/, "").length < 10) {
      return {
        success: false,
        error: "Telefone/WhatsApp inválido. Informe DDD e número completo.",
      };
    }

    const protocolo = await gerarProtocoloUnicoVoluntario();

    await prisma.voluntarioInscricao.create({
      data: {
        protocolo,
        nome: payload.nome,
        whatsapp: wppE164,
        municipio: payload.municipio,
        disponibilidade: payload.disponibilidade,
        modalidade: payload.modalidade,
        descricao: payload.descricao,
        aceitouTermosLGPD: true,
      },
    });

    revalidatePath("/ajude");
    revalidatePath("/dashboard/ajudas");
    revalidatePath("/dashboard");

    return {
      success: true,
      protocolo,
    };
  } catch (error) {
    console.error("[ERRO_CRIAR_VOLUNTARIO]", error);
    return {
      success: false,
      error: "Não foi possível registrar seu cadastro. Tente novamente.",
    };
  }
}

/**
 * Server Action administrativa para atualizar status de um voluntário e gerar link wa.me.
 */
export async function atualizarStatusVoluntario(input: {
  id: string;
  status: StatusVoluntario;
  observacaoEquipe?: string;
}): Promise<AtualizarStatusVoluntarioResult> {
  try {
    const admin = await requireAuth();

    const validated = atualizarStatusVoluntarioSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Dados inválidos.",
      };
    }

    const data = validated.data;
    const atualizado = await prisma.voluntarioInscricao.update({
      where: { id: data.id },
      data: {
        status: data.status,
        observacaoEquipe: data.observacaoEquipe?.trim() || null,
        atendidoPorId: admin.id,
      },
    });

    const whatsappUrl = gerarLinkWhatsappVoluntario(atualizado.whatsapp, {
      nome: atualizado.nome,
      protocolo: atualizado.protocolo,
      modalidade: atualizado.modalidade,
      municipio: atualizado.municipio,
      disponibilidade: atualizado.disponibilidade,
      observacaoEquipe: atualizado.observacaoEquipe,
    });

    revalidatePath("/dashboard/ajudas");
    revalidatePath("/dashboard");

    return {
      success: true,
      whatsappUrl,
    };
  } catch (error) {
    console.error("[ERRO_ATUALIZAR_VOLUNTARIO]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Falha ao atualizar status do voluntário.",
    };
  }
}

