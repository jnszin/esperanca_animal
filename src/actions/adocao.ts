"use server";

import { prisma } from "@/lib/prisma";
import { adocaoSchema, AdocaoFormData } from "@/schemas/adocao";
import { calcularScoreTriagem } from "@/lib/triagem";
import { notificarNovaAdocao } from "@/lib/n8n";
import { StatusAnimal } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type SubmeterAdocaoResult = {
  success: boolean;
  protocolo?: string;
  scoreTriagem?: number;
  error?: string;
};

/**
 * Server Action pública para envio do formulário de triagem de adoção.
 * Realiza validação Zod, cálculo de score de compatibilidade,
 * gravação relacional no Postgres e notificação via n8n (WhatsApp).
 */
export async function submeterSolicitacaoAdocao(
  data: AdocaoFormData
): Promise<SubmeterAdocaoResult> {
  // 1. Validação com Zod no Backend
  const validated = adocaoSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Dados de formulário inválidos.",
    };
  }

  const payload = validated.data;

  try {
    // 2. Busca e validação do animal solicitado
    const animal = await prisma.animal.findUnique({
      where: { id: payload.animalId },
      select: {
        id: true,
        nome: true,
        status: true,
        exigeTelaProtecao: true,
        porte: true,
        especie: true,
      },
    });

    if (!animal) {
      return {
        success: false,
        error: "Animal não encontrado ou não está mais disponível.",
      };
    }

    if (animal.status !== StatusAnimal.DISPONIVEL) {
      return {
        success: false,
        error: `O animal "${animal.nome}" não está mais disponível para novas solicitações no momento.`,
      };
    }

    // 3. Execução do Motor de Pré-Triagem Automatizado
    const triagem = calcularScoreTriagem(animal, {
      tipoMoradia: payload.tipoMoradia,
      imovelProprio: payload.imovelProprio,
      proprietarioPermite: payload.proprietarioPermite,
      todosConcordam: payload.todosConcordam,
      possuiOutrosAnimais: payload.possuiOutrosAnimais,
      horasAnimalSozinho: payload.horasAnimalSozinho,
      cienteCustosMensais: payload.cienteCustosMensais,
    });

    // 4. Geração de Protocolo Único (ex: "ADO-2026-7491")
    const anoAtual = new Date().getFullYear();
    const codigoAleatorio = Math.floor(1000 + Math.random() * 9000);
    const protocolo = `ADO-${anoAtual}-${codigoAleatorio}`;

    // Sanitiza e padroniza WhatsApp para formato E.164 (5527999999999)
    let wppFormatado = payload.whatsapp.replace(/\D/g, "");
    if (!wppFormatado.startsWith("55") && (wppFormatado.length === 10 || wppFormatado.length === 11)) {
      wppFormatado = `55${wppFormatado}`;
    }

    // 5. Gravação da Solicitação no PostgreSQL (VPS)
    await prisma.solicitacaoAdocao.create({
      data: {
        protocolo,
        nomeAdotante: payload.nomeAdotante,
        cpf: payload.cpf,
        email: payload.email,
        whatsapp: wppFormatado,
        dataNascimento: new Date(payload.dataNascimento),
        cep: payload.cep,
        enderecoCompleto: payload.enderecoCompleto,
        bairro: payload.bairro,
        cidade: payload.cidade,
        estado: payload.estado,
        aceitouTermosLGPD: true,
        dataConsentimentoLGPD: new Date(),

        // Perguntas de triagem
        tipoMoradia: payload.tipoMoradia,
        imovelProprio: payload.imovelProprio,
        proprietarioPermite: payload.proprietarioPermite,
        todosConcordam: payload.todosConcordam,
        possuiOutrosAnimais: payload.possuiOutrosAnimais,
        detalhesOutrosAnimais: payload.detalhesOutrosAnimais || null,
        horasAnimalSozinho: payload.horasAnimalSozinho,
        cienteCustosMensais: true,
        motivoAdocao: payload.motivoAdocao,

        // Score e automação
        scoreTriagem: triagem.scoreTriagem,
        observacoesSistema: triagem.observacoesSistema,
        status: triagem.statusSugerido,

        // Vínculo relacional
        animalId: animal.id,
      },
    });

    // 6. Disparo Assíncrono para o n8n (WhatsApp com Protocolo)
    // Executado em segundo plano para não onerar o tempo de resposta do formulário
    notificarNovaAdocao({
      protocolo,
      nomeAdotante: payload.nomeAdotante,
      whatsapp: wppFormatado,
      nomeAnimal: animal.nome,
      scoreTriagem: triagem.scoreTriagem,
    }).catch((err) => {
      console.error("[N8N_NOTIFICACAO_ERRO]", err);
    });

    // 7. Revalida caches
    revalidatePath("/animais");
    revalidatePath("/dashboard/adocoes");

    return {
      success: true,
      protocolo,
      scoreTriagem: triagem.scoreTriagem,
    };
  } catch (error) {
    console.error("[ERRO_SUBMETER_ADOCAO]", error);
    return {
      success: false,
      error: "Ocorreu uma instabilidade ao salvar sua solicitação. Tente novamente.",
    };
  }
}

