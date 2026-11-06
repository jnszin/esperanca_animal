import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type EventoNotificacao =
  | "ADOCAO_RECEBIDA"
  | "CHAMADO_ACOLHIMENTO_CRIADO"
  | "STATUS_ADOCAO_ATUALIZADO"
  | "DOACAO_PIX_CONFIRMADA";

interface DisparoN8NParams {
  evento: EventoNotificacao;
  destinatario: string; // WhatsApp no formato E.164 (ex: "5527999999999")
  payload: Record<string, unknown>;
}

/**
 * Função central de mensageria para automação via n8n (VPS).
 * 
 * DIRETRIZ CRÍTICA DE ARQUITETURA:
 * O envio é 100% assíncrono e blindado com try/catch e timeout.
 * Se o n8n ou a Evolution API ficarem temporariamente fora do ar,
 * a experiência do usuário no Next.js NÃO É INTERROMPIDA.
 */
export async function dispararWebhookN8N({
  evento,
  destinatario,
  payload,
}: DisparoN8NParams): Promise<boolean> {
  const n8nBaseUrl = process.env.N8N_WEBHOOK_URL;
  const webhookSecret = process.env.WEBHOOK_SECRET || "";

  // Se a URL do n8n não estiver configurada no .env, registra em log e não falha
  if (!n8nBaseUrl) {
    console.warn(`[N8N_DISPATCH_SKIPPED] N8N_WEBHOOK_URL não configurada. Evento: ${evento}`);
    return false;
  }

  // Sanitiza o número do WhatsApp (apenas dígitos)
  const telefoneSanitizado = destinatario.replace(/\D/g, "");

  const bodyData = {
    evento,
    destinatario: telefoneSanitizado,
    timestamp: new Date().toISOString(),
    origem: "esperanca-animal-web",
    dados: payload,
  };

  let sucesso = false;
  let erroMensagem: string | null = null;

  try {
    const response = await fetch(n8nBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": webhookSecret,
      },
      body: JSON.stringify(bodyData),
      signal: AbortSignal.timeout(6000), // Timeout de 6 segundos para não segurar a requisição
    });

    if (response.ok) {
      sucesso = true;
    } else {
      erroMensagem = `HTTP ${response.status}: ${response.statusText}`;
      console.error(`[N8N_ERROR] Resposta não-OK do n8n:`, erroMensagem);
    }
  } catch (error) {
    erroMensagem = error instanceof Error ? error.message : "Erro desconhecido ao chamar n8n";
    console.error(`[N8N_FETCH_FAILED] Falha na requisição para n8n (${evento}):`, erroMensagem);
  }

  // Registra auditoria no banco de dados sem bloquear a execução
  try {
    await prisma.logNotificacao.create({
      data: {
        evento,
        destinatario: telefoneSanitizado,
        payload: bodyData as Prisma.InputJsonValue,
        sucesso,
        erroMensagem,
      },
    });
  } catch (dbError) {
    // Se o banco estiver temporariamente indisponível, apenas exibe no console
    console.warn(`[LOG_NOTIFICACAO_SKIPPED] Não foi possível persistir LogNotificacao:`, dbError);
  }

  return sucesso;
}

// ========================================================
// HELPERS TIPADOS DE DISPARO PARA CADA FLUXO DO SISTEMA
// ========================================================

/**
 * Notifica o cidadão sobre a recepção da sua solicitação de adoção e envia o protocolo.
 */
export async function notificarNovaAdocao(params: {
  protocolo: string;
  nomeAdotante: string;
  whatsapp: string;
  nomeAnimal: string;
  scoreTriagem: number;
}) {
  return dispararWebhookN8N({
    evento: "ADOCAO_RECEBIDA",
    destinatario: params.whatsapp,
    payload: {
      protocolo: params.protocolo,
      nomeAdotante: params.nomeAdotante,
      nomeAnimal: params.nomeAnimal,
      scoreTriagem: params.scoreTriagem,
      mensagem: `Olá, ${params.nomeAdotante}! Sua solicitação de adoção para o(a) ${params.nomeAnimal} foi recebida com sucesso! Protocolo: ${params.protocolo}. Nossa equipe da Esperança Animal entrará em contato em breve.`,
    },
  });
}

/**
 * Notifica o cidadão sobre o registro de um chamado de acolhimento/resgate.
 */
export async function notificarNovoChamado(params: {
  protocolo: string;
  nomeSolicitante: string;
  whatsapp: string;
  especie: string;
  nivelUrgencia: string;
  bairro: string;
  cidade: string;
}) {
  return dispararWebhookN8N({
    evento: "CHAMADO_ACOLHIMENTO_CRIADO",
    destinatario: params.whatsapp,
    payload: {
      protocolo: params.protocolo,
      nomeSolicitante: params.nomeSolicitante,
      especie: params.especie,
      nivelUrgencia: params.nivelUrgencia,
      localizacao: `${params.bairro}, ${params.cidade}`,
      mensagem: `Olá, ${params.nomeSolicitante}! O chamado de resgate (${params.protocolo}) foi registrado na ONG Esperança Animal. Classificação de urgência: ${params.nivelUrgencia}. Fique atento a este canal para atualizações.`,
    },
  });
}

/**
 * Notifica o adotante quando o voluntário atualiza o status no backoffice (Aprovado, Entrevista, etc).
 */
export async function notificarAtualizacaoAdocao(params: {
  protocolo: string;
  nomeAdotante: string;
  whatsapp: string;
  nomeAnimal: string;
  novoStatus: string;
  observacoes?: string | null;
}) {
  return dispararWebhookN8N({
    evento: "STATUS_ADOCAO_ATUALIZADO",
    destinatario: params.whatsapp,
    payload: {
      protocolo: params.protocolo,
      nomeAdotante: params.nomeAdotante,
      nomeAnimal: params.nomeAnimal,
      status: params.novoStatus,
      observacoes: params.observacoes || null,
      mensagem: `Olá, ${params.nomeAdotante}! Há uma atualização na sua solicitação de adoção (${params.protocolo}) para o pet ${params.nomeAnimal}. Novo status: ${params.novoStatus}.`,
    },
  });
}

/**
 * Notifica o doador quando um pagamento Pix é confirmado pelo Gateway.
 */
export async function notificarPixConfirmado(params: {
  externalTxId: string;
  nomeDoador: string;
  whatsapp: string;
  valor: number;
  campanhaTitulo?: string | null;
}) {
  const valorFormatado = params.valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return dispararWebhookN8N({
    evento: "DOACAO_PIX_CONFIRMADA",
    destinatario: params.whatsapp,
    payload: {
      txId: params.externalTxId,
      nomeDoador: params.nomeDoador,
      valor: valorFormatado,
      campanha: params.campanhaTitulo || "Doação Geral",
      mensagem: `Muito obrigado, ${params.nomeDoador}! Sua doação Pix no valor de ${valorFormatado} para a ONG Esperança Animal foi confirmada! Seu apoio salva vidas de animais resgatados. ❤️🐾`,
    },
  });
}
