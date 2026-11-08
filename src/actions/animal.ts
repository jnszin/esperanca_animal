"use server";

import { prisma } from "@/lib/prisma";
import { animalSchema } from "@/schemas/animal";
import { uploadImageToR2 } from "@/lib/storage";
import { requireAuth } from "@/lib/auth-checks";
import { revalidatePath } from "next/cache";
import { Especie, Porte, Sexo, StatusAnimal, StatusAcolhimento } from "@prisma/client";

export type CriarAnimalResult = {
  success: boolean;
  slug?: string;
  error?: string;
};

function gerarSlug(nome: string, especie: string): string {
  const limpo = `${nome}-${especie}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const randomHash = Math.random().toString(36).substring(2, 6);
  return `${limpo}-${randomHash}`;
}

/**
 * Server Action protegida para cadastro de novos animais na vitrine pública.
 * Processa fotos com Sharp, converte para WebP e salva no Cloudflare R2.
 */
export async function cadastrarAnimal(formData: FormData): Promise<CriarAnimalResult> {
  try {
    // 1. Defesa em Profundidade: exige usuário autenticado (Voluntário ou Admin)
    await requireAuth();

    // 2. Extração dos campos do FormData
    const temperamentoRaw = formData.get("temperamento") as string;
    let temperamentoArray: string[] = [];
    if (temperamentoRaw) {
      temperamentoArray = temperamentoRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const rawData = {
      nome: formData.get("nome") as string,
      especie: formData.get("especie") as Especie,
      raca: (formData.get("raca") as string) || "SRD (Sem Raça Definida)",
      porte: formData.get("porte") as Porte,
      sexo: formData.get("sexo") as Sexo,
      idadeEstimadaMeses: Number(formData.get("idadeEstimadaMeses")),
      pesoKg: formData.get("pesoKg") ? Number(formData.get("pesoKg")) : null,
      castrado: formData.get("castrado") === "true",
      vacinado: formData.get("vacinado") === "true",
      vermifugado: formData.get("vermifugado") === "true",
      necessidadesEspeciais: formData.get("necessidadesEspeciais") === "true",
      descricaoSaude: (formData.get("descricaoSaude") as string) || undefined,
      temperamento: temperamentoArray,
      exigeTelaProtecao: formData.get("exigeTelaProtecao") === "true",
      historia: formData.get("historia") as string,
      status: (formData.get("status") as StatusAnimal) || StatusAnimal.DISPONIVEL,
      destaqueVitrine: formData.get("destaqueVitrine") === "true",
      chamadoOrigemId: (formData.get("chamadoOrigemId") as string) || null,
    };

    // 3. Validação com Zod
    const validated = animalSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Dados do animal inválidos.",
      };
    }

    const payload = validated.data;
    const slug = gerarSlug(payload.nome, payload.especie);

    // 4. Upload de fotos para o Cloudflare R2
    const fotosFiles = formData.getAll("fotos") as File[];
    const fotosCriadas: { url: string; keyStorage: string; principal: boolean; ordem: number }[] = [];

    let ordem = 0;
    for (const file of fotosFiles) {
      if (file && file.size > 0 && file.type.startsWith("image/")) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const uploadRes = await uploadImageToR2(buffer, "animais", file.name);
          fotosCriadas.push({
            url: uploadRes.url,
            keyStorage: uploadRes.keyStorage,
            principal: ordem === 0,
            ordem: ordem++,
          });
        } catch (uploadErr) {
          console.error("[ANIMAL_FOTO_UPLOAD_ERROR]", uploadErr);
        }
      }
    }

    // Se nenhuma foto foi enviada, usa placeholder padrão para não quebrar a vitrine
    if (fotosCriadas.length === 0) {
      const defaultFotoUrl =
        payload.especie === Especie.GATO
          ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800"
          : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800";

      fotosCriadas.push({
        url: defaultFotoUrl,
        keyStorage: `default/${slug}.jpg`,
        principal: true,
        ordem: 0,
      });
    }

    // 5. Persistência no PostgreSQL na VPS
    const animal = await prisma.animal.create({
      data: {
        nome: payload.nome,
        slug,
        especie: payload.especie,
        raca: payload.raca,
        porte: payload.porte,
        sexo: payload.sexo,
        idadeEstimadaMeses: payload.idadeEstimadaMeses,
        pesoKg: payload.pesoKg ?? null,
        castrado: payload.castrado,
        vacinado: payload.vacinado,
        vermifugado: payload.vermifugado,
        necessidadesEspeciais: payload.necessidadesEspeciais,
        descricaoSaude: payload.descricaoSaude ?? null,
        temperamento: payload.temperamento,
        exigeTelaProtecao: payload.exigeTelaProtecao,
        historia: payload.historia,
        status: payload.status,
        destaqueVitrine: payload.destaqueVitrine,
        chamadoOrigemId: payload.chamadoOrigemId ?? null,
        fotos: {
          create: fotosCriadas,
        },
      },
    });

    // 6. Se veio de um chamado de acolhimento, marca o chamado como RESGATADO
    if (payload.chamadoOrigemId) {
      await prisma.chamadoAcolhimento.update({
        where: { id: payload.chamadoOrigemId },
        data: {
          status: StatusAcolhimento.RESGATADO,
          parecerONG: `Animal acolhido e cadastrado na vitrine de adoção como ${animal.nome} (${animal.slug}).`,
        },
      });
    }

    // 7. Revalidação de rotas no Next.js
    revalidatePath("/animais");
    revalidatePath("/dashboard/animais");
    revalidatePath("/dashboard/chamados");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return {
      success: true,
      slug: animal.slug,
    };
  } catch (error) {
    console.error("[ERRO_CADASTRAR_ANIMAL]", error);
    return {
      success: false,
      error: "Ocorreu um erro ao cadastrar o animal. Tente novamente.",
    };
  }
}

/**
 * Server Action protegida para atualizar o status do animal
 * (ex: de DISPONIVEL para EM_PROCESSO, ADOTADO ou EM_TRATAMENTO).
 */
export async function atualizarStatusAnimal(params: {
  id: string;
  status: StatusAnimal;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();

    await prisma.animal.update({
      where: { id: params.id },
      data: { status: params.status },
    });

    revalidatePath("/dashboard/animais");
    revalidatePath("/animais");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ERRO_ATUALIZAR_STATUS_ANIMAL]", error);
    return { success: false, error: "Falha ao atualizar status do animal." };
  }
}

/**
 * Server Action protegida para alternar se o animal aparece
 * nos destaques da página inicial.
 */
export async function alternarDestaqueAnimal(params: {
  id: string;
  destaque: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();

    await prisma.animal.update({
      where: { id: params.id },
      data: { destaqueVitrine: params.destaque },
    });

    revalidatePath("/dashboard/animais");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ERRO_DESTAQUE_ANIMAL]", error);
    return { success: false, error: "Falha ao alterar destaque do animal." };
  }
}

