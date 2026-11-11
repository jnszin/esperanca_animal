"use server";

import { prisma } from "@/lib/prisma";
import { animalSchema } from "@/schemas/animal";
import { uploadImageToR2, deleteImageFromR2 } from "@/lib/storage";
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

    // 4. Validação e Upload de fotos para o Cloudflare R2 (Obrigatoriedade de foto real de vitrine)
    const fotosFiles = formData.getAll("fotos") as File[];
    const fotosValidas = fotosFiles.filter(
      (file) => file && file.size >= 10000 && file.type.startsWith("image/")
    );

    if (fotosValidas.length === 0) {
      return {
        success: false,
        error: "É obrigatório anexar pelo menos uma foto real e nítida do animal (mínimo 10KB) para publicação na vitrine.",
      };
    }

    const fotosCriadas: { url: string; keyStorage: string; principal: boolean; ordem: number }[] = [];

    let ordem = 0;
    for (const file of fotosValidas) {
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

    if (fotosCriadas.length === 0) {
      return {
        success: false,
        error: "Falha ao processar a foto enviada. Verifique o arquivo e tente novamente.",
      };
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

/**
 * Server Action protegida para arquivar (exclusão lógica) um animal da vitrine.
 * Registra o motivo oficial selecionado pelo colaborador e a data do arquivamento.
 */
export async function arquivarAnimal(params: {
  id: string;
  motivo: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();

    if (!params.motivo || params.motivo.trim().length < 3) {
      return { success: false, error: "Informe um motivo válido para arquivar o cadastro." };
    }

    const motivoNormalizado = params.motivo.trim();
    const novoStatus = motivoNormalizado.toLowerCase().includes("adotado")
      ? StatusAnimal.ADOTADO
      : StatusAnimal.INDISPONIVEL;

    await prisma.animal.update({
      where: { id: params.id },
      data: {
        ativo: false,
        destaqueVitrine: false,
        status: novoStatus,
        motivoArquivamento: motivoNormalizado,
        dataArquivamento: new Date(),
      },
    });

    revalidatePath("/dashboard/animais");
    revalidatePath("/animais");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ERRO_ARQUIVAR_ANIMAL]", error);
    return { success: false, error: "Falha ao arquivar animal. Tente novamente." };
  }
}

/**
 * Server Action protegida para restaurar um animal arquivado de volta à vitrine ativa.
 */
export async function restaurarAnimal(params: {
  id: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();

    await prisma.animal.update({
      where: { id: params.id },
      data: {
        ativo: true,
        status: StatusAnimal.DISPONIVEL,
        motivoArquivamento: null,
        dataArquivamento: null,
      },
    });

    revalidatePath("/dashboard/animais");
    revalidatePath("/animais");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ERRO_RESTAURAR_ANIMAL]", error);
    return { success: false, error: "Falha ao restaurar animal. Tente novamente." };
  }
}

/**
 * Server Action protegida para edição completa do cadastro de um pet.
 */
export async function editarAnimal(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();

    const id = formData.get("id") as string;
    if (!id) {
      return { success: false, error: "ID do animal não informado." };
    }

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
    };

    const validated = animalSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Dados inválidos.",
      };
    }

    const payload = validated.data;

    // Atualiza dados no banco
    const animalAtualizado = await prisma.animal.update({
      where: { id },
      data: {
        nome: payload.nome,
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
      },
    });

    // Se novas fotos foram enviadas, faz upload no R2
    const novasFotos = formData.getAll("novasFotos") as File[];
    for (const file of novasFotos) {
      if (file && file.size > 0 && file.type.startsWith("image/")) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const uploadRes = await uploadImageToR2(buffer, "animais", file.name);
          await prisma.fotoAnimal.create({
            data: {
              animalId: id,
              url: uploadRes.url,
              keyStorage: uploadRes.keyStorage,
              principal: false,
              ordem: 1,
            },
          });
        } catch (uploadErr) {
          console.error("[EDITAR_ANIMAL_FOTO_ERROR]", uploadErr);
        }
      }
    }

    revalidatePath("/animais");
    revalidatePath(`/animais/${animalAtualizado.slug}`);
    revalidatePath("/dashboard/animais");
    revalidatePath(`/dashboard/animais/${id}/editar`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ERRO_EDITAR_ANIMAL]", error);
    return { success: false, error: "Falha ao salvar edições do animal." };
  }
}

/**
 * Server Action protegida para exclusão de foto específica do animal.
 */
export async function excluirFotoAnimal(params: {
  fotoId: string;
  animalId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();

    const foto = await prisma.fotoAnimal.findUnique({
      where: { id: params.fotoId },
      select: { id: true, keyStorage: true },
    });

    if (!foto) {
      return { success: false, error: "Foto não encontrada." };
    }

    await prisma.fotoAnimal.delete({
      where: { id: params.fotoId },
    });

    await deleteImageFromR2(foto.keyStorage);

    revalidatePath(`/dashboard/animais/${params.animalId}/editar`);
    revalidatePath("/animais");
    revalidatePath("/dashboard/animais");
    revalidatePath("/transparencia");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ERRO_EXCLUIR_FOTO_ANIMAL]", error);
    return { success: false, error: "Falha ao excluir foto." };
  }
}

