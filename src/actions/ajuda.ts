"use server";

import { prisma } from "@/lib/prisma";
import {
  atualizarStatusAjudaSchema,
  ofertaAjudaSchema,
} from "@/schemas/ajuda";
import { gerarLinkWhatsappAjuda } from "@/lib/ajuda-labels";
import { sanitizarWhatsappE164 } from "@/lib/utils";
import { requireAuth } from "@/lib/auth-checks";
import { revalidatePath } from "next/cache";
import type {
  FormaEntregaAjuda,
  StatusOfertaAjuda,
  TipoAjudaONG,
} from "@prisma/client";

export type CriarOfertaAjudaResult = {
  success: boolean;
  protocolo?: string;
  error?: string;
};

export type AtualizarStatusAjudaResult = {
  success: boolean;
  whatsappUrl?: string;
  error?: string;
};

async function gerarProtocoloUnicoAjuda(): Promise<string> {
  const ano = new Date().getFullYear();

  for (let i = 0; i < 6; i++) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const candidato = `AJU-${ano}-${num}`;
    const existe = await prisma.ofertaAjuda.findUnique({
      where: { protocolo: candidato },
      select: { id: true },
    });
    if (!existe) return candidato;
  }

  return `AJU-${ano}-${Date.now().toString().slice(-5)}`;
}

/**
 * Server Action pública para registrar oferta de ajuda, ração, itens ou apoio financeiro.
 */
export async function criarOfertaAjuda(
  formData: FormData
): Promise<CriarOfertaAjudaResult> {
  try {
    const rawData = {
      tipoAjuda: formData.get("tipoAjuda") as TipoAjudaONG,
      formaEntrega:
        (formData.get("formaEntrega") as FormaEntregaAjuda) || "A_COMBINAR",
      nomeDoador: formData.get("nomeDoador") as string,
      whatsapp: formData.get("whatsapp") as string,
      municipio: formData.get("municipio") as string,
      bairro: (formData.get("bairro") as string) || undefined,
      mensagem: formData.get("mensagem") as string,
      aceitouTermosLGPD: formData.get("aceitouTermosLGPD") === "true",
    };

    const validated = ofertaAjudaSchema.safeParse(rawData);
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
        error: "WhatsApp inválido. Informe DDD e número completo.",
      };
    }

    const protocolo = await gerarProtocoloUnicoAjuda();

    await prisma.ofertaAjuda.create({
      data: {
        protocolo,
        nomeDoador: payload.nomeDoador,
        whatsapp: wppE164,
        municipio: payload.municipio,
        bairro: payload.bairro || null,
        aceitouTermosLGPD: true,
        tipoAjuda: payload.tipoAjuda,
        formaEntrega: payload.formaEntrega,
        mensagem: payload.mensagem,
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
    console.error("[ERRO_CRIAR_OFERTA_AJUDA]", error);
    return {
      success: false,
      error: "Não foi possível enviar sua oferta de ajuda. Tente novamente.",
    };
  }
}

/**
 * Server Action protegida para atualizar o atendimento da oferta de ajuda e gerar link de WhatsApp.
 */
export async function atualizarStatusAjuda(params: {
  id: string;
  status: StatusOfertaAjuda;
  observacaoEquipe?: string;
}): Promise<AtualizarStatusAjudaResult> {
  try {
    const user = await requireAuth();

    const validated = atualizarStatusAjudaSchema.safeParse(params);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Dados inválidos.",
      };
    }

    const payload = validated.data;

    const atualizado = await prisma.ofertaAjuda.update({
      where: { id: payload.id },
      data: {
        status: payload.status,
        observacaoEquipe: payload.observacaoEquipe?.trim() || null,
        atendidoPorId: user.id,
      },
    });

    const whatsappUrl = gerarLinkWhatsappAjuda(atualizado.whatsapp, {
      nomeDoador: atualizado.nomeDoador,
      protocolo: atualizado.protocolo,
      tipoAjuda: atualizado.tipoAjuda,
      municipio: atualizado.municipio,
      observacaoEquipe: atualizado.observacaoEquipe,
    });

    revalidatePath("/dashboard/ajudas");
    revalidatePath("/dashboard");

    return {
      success: true,
      whatsappUrl,
    };
  } catch (error) {
    console.error("[ERRO_ATUALIZAR_OFERTA_AJUDA]", error);
    return {
      success: false,
      error: "Falha ao atualizar status da oferta.",
    };
  }
}

