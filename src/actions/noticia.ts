"use server";

import { prisma } from "@/lib/prisma";
import { noticiaSchema } from "@/schemas/noticia";
import { uploadImageToR2 } from "@/lib/storage";
import { requireAuth } from "@/lib/auth-checks";
import { revalidatePath } from "next/cache";

export type NoticiaActionResult = {
  success: boolean;
  slug?: string;
  error?: string;
};

function gerarSlugNoticia(titulo: string): string {
  const limpo = titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const randomHash = Math.random().toString(36).substring(2, 6);
  return `${limpo.substring(0, 60)}-${randomHash}`;
}

/**
 * Server Action protegida para publicação de novas notícias/projetos no Blog.
 */
export async function criarNoticia(formData: FormData): Promise<NoticiaActionResult> {
  try {
    const user = await requireAuth();

    const rawData = {
      titulo: formData.get("titulo") as string,
      subtitulo: (formData.get("subtitulo") as string) || null,
      conteudo: formData.get("conteudo") as string,
      categoria: (formData.get("categoria") as string) || "Projetos & Resgates",
      publicado: formData.get("publicado") === "true",
      tempoLeituraMin: Number(formData.get("tempoLeituraMin")) || 2,
      autorNome: (formData.get("autorNome") as string) || user.nome || "Equipe Esperança Animal",
    };

    const validated = noticiaSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Dados inválidos.",
      };
    }

    const payload = validated.data;
    const slug = gerarSlugNoticia(payload.titulo);

    // Upload da imagem de capa (se enviada)
    const capaFile = formData.get("imagemCapa") as File | null;
    let imagemCapaUrl: string | null = null;
    let imagemCapaKey: string | null = null;

    if (capaFile && capaFile.size > 0 && capaFile.type.startsWith("image/")) {
      try {
        const buffer = Buffer.from(await capaFile.arrayBuffer());
        const uploadRes = await uploadImageToR2(buffer, "noticias", capaFile.name);
        imagemCapaUrl = uploadRes.url;
        imagemCapaKey = uploadRes.keyStorage;
      } catch (uploadErr) {
        console.error("[NOTICIA_CAPA_UPLOAD_ERROR]", uploadErr);
      }
    }

    // Se nenhuma foto foi enviada, usa placeholder temático de projetos
    if (!imagemCapaUrl) {
      imagemCapaUrl =
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200";
    }

    const noticia = await prisma.noticia.create({
      data: {
        titulo: payload.titulo,
        slug,
        subtitulo: payload.subtitulo,
        conteudo: payload.conteudo,
        imagemCapaUrl,
        imagemCapaKey,
        categoria: payload.categoria,
        publicado: payload.publicado,
        tempoLeituraMin: payload.tempoLeituraMin,
        autorNome: payload.autorNome,
        autorId: user.id,
      },
    });

    revalidatePath("/noticias");
    revalidatePath("/dashboard/noticias");
    revalidatePath("/");

    return {
      success: true,
      slug: noticia.slug,
    };
  } catch (error) {
    console.error("[ERRO_CRIAR_NOTICIA]", error);
    return {
      success: false,
      error: "Ocorreu um erro ao publicar a notícia. Tente novamente.",
    };
  }
}

/**
 * Server Action protegida para editar matéria existente.
 */
export async function editarNoticia(formData: FormData): Promise<NoticiaActionResult> {
  try {
    await requireAuth();

    const id = formData.get("id") as string;
    if (!id) {
      return { success: false, error: "ID da matéria não informado." };
    }

    const rawData = {
      titulo: formData.get("titulo") as string,
      subtitulo: (formData.get("subtitulo") as string) || null,
      conteudo: formData.get("conteudo") as string,
      categoria: (formData.get("categoria") as string) || "Projetos & Resgates",
      publicado: formData.get("publicado") === "true",
      tempoLeituraMin: Number(formData.get("tempoLeituraMin")) || 2,
      autorNome: (formData.get("autorNome") as string) || "Equipe Esperança Animal",
    };

    const validated = noticiaSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Dados inválidos.",
      };
    }

    const payload = validated.data;

    // Nova capa opcional
    const capaFile = formData.get("novaImagemCapa") as File | null;
    let novaCapaUrl: string | undefined = undefined;
    let novaCapaKey: string | undefined = undefined;

    if (capaFile && capaFile.size > 0 && capaFile.type.startsWith("image/")) {
      try {
        const buffer = Buffer.from(await capaFile.arrayBuffer());
        const uploadRes = await uploadImageToR2(buffer, "noticias", capaFile.name);
        novaCapaUrl = uploadRes.url;
        novaCapaKey = uploadRes.keyStorage;
      } catch (uploadErr) {
        console.error("[EDITAR_NOTICIA_UPLOAD_ERROR]", uploadErr);
      }
    }

    const noticiaAtualizada = await prisma.noticia.update({
      where: { id },
      data: {
        titulo: payload.titulo,
        subtitulo: payload.subtitulo,
        conteudo: payload.conteudo,
        categoria: payload.categoria,
        publicado: payload.publicado,
        tempoLeituraMin: payload.tempoLeituraMin,
        autorNome: payload.autorNome,
        ...(novaCapaUrl ? { imagemCapaUrl: novaCapaUrl, imagemCapaKey: novaCapaKey } : {}),
      },
    });

    revalidatePath("/noticias");
    revalidatePath(`/noticias/${noticiaAtualizada.slug}`);
    revalidatePath("/dashboard/noticias");
    revalidatePath("/");

    return { success: true, slug: noticiaAtualizada.slug };
  } catch (error) {
    console.error("[ERRO_EDITAR_NOTICIA]", error);
    return { success: false, error: "Falha ao salvar edições da matéria." };
  }
}

/**
 * Server Action protegida para excluir matéria do blog.
 */
export async function excluirNoticia(params: {
  id: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();

    await prisma.noticia.delete({
      where: { id: params.id },
    });

    revalidatePath("/noticias");
    revalidatePath("/dashboard/noticias");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ERRO_EXCLUIR_NOTICIA]", error);
    return { success: false, error: "Falha ao excluir matéria." };
  }
}

/**
 * Server Action protegida para alternar publicação (Rascunho vs Publicado).
 */
export async function alternarPublicacaoNoticia(params: {
  id: string;
  publicado: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();

    await prisma.noticia.update({
      where: { id: params.id },
      data: { publicado: params.publicado },
    });

    revalidatePath("/noticias");
    revalidatePath("/dashboard/noticias");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ERRO_ALTERNAR_PUBLICACAO]", error);
    return { success: false, error: "Falha ao alterar status de publicação." };
  }
}

