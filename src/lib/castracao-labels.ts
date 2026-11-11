import type {
  Especie,
  Sexo,
  StatusSolicitacaoServico,
  TipoServicoPet,
} from "@prisma/client";

export const SERVICO_CONFIG: Record<
  TipoServicoPet,
  { label: string; shortLabel: string; descricao: string; badge: string }
> = {
  CASTRACAO: {
    label: "Castração",
    shortLabel: "Castração",
    descricao: "Cirurgia de esterilização segura com avaliação prévia",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  VACINACAO: {
    label: "Vacinação",
    shortLabel: "Vacinação",
    descricao: "Imunização essencial (V8/V10, V4 ou antirrábica)",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
  },
  CASTRACAO_E_VACINACAO: {
    label: "Castração + Vacinação",
    shortLabel: "Castração + Vacina",
    descricao: "Solicitação conjunta de proteção sanitária e castração",
    badge: "bg-purple-100 text-purple-800 border-purple-200",
  },
};

export const STATUS_SERVICO_CONFIG: Record<
  StatusSolicitacaoServico,
  {
    label: string;
    badge: string;
    border: string;
    avisoPadrao: string;
    ordem: number;
  }
> = {
  REGISTRADO: {
    label: "Caso Registrado (Com a Equipe)",
    badge: "bg-neutral-100 text-neutral-800 border-neutral-300",
    border: "border-l-4 border-l-neutral-400",
    avisoPadrao:
      "Caso registrado com sucesso! Sua solicitação já está com a equipe da Esperança Animal para avaliação.",
    ordem: 1,
  },
  EM_ANALISE: {
    label: "Em Análise pela Equipe",
    badge: "bg-amber-100 text-amber-900 border-amber-200",
    border: "border-l-4 border-l-amber-500",
    avisoPadrao:
      "Nossa equipe está analisando os dados do pet, peso e disponibilidade de vagas para o seu município.",
    ordem: 2,
  },
  APROVADO_FILA: {
    label: "Aprovado — Na Fila de Agendamento",
    badge: "bg-blue-100 text-blue-900 border-blue-200",
    border: "border-l-4 border-l-blue-500",
    avisoPadrao:
      "Cadastro aprovado! Seu pet entrou na fila de atendimento do município e em breve enviaremos data e local.",
    ordem: 3,
  },
  AGENDADO: {
    label: "Agendado (Data Confirmada)",
    badge: "bg-purple-100 text-purple-900 border-purple-200",
    border: "border-l-4 border-l-purple-600",
    avisoPadrao:
      "Procedimento agendado! Confira atentamente a data, o local de atendimento e as orientações de preparo.",
    ordem: 4,
  },
  REALIZADO: {
    label: "Procedimento Realizado",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-200",
    border: "border-l-4 border-l-emerald-600",
    avisoPadrao:
      "Procedimento concluído com sucesso! Obrigado por cuidar com amor e responsabilidade do seu pet.",
    ordem: 5,
  },
  CANCELADO: {
    label: "Cancelado / Não Elegível",
    badge: "bg-red-100 text-red-900 border-red-200",
    border: "border-l-4 border-l-red-500",
    avisoPadrao:
      "Solicitação encerrada ou cancelada. Caso precise de novas orientações, entre em contato com a equipe.",
    ordem: 0,
  },
};

export const PIPELINE_ETAPAS: StatusSolicitacaoServico[] = [
  "REGISTRADO",
  "EM_ANALISE",
  "APROVADO_FILA",
  "AGENDADO",
  "REALIZADO",
];

export const ESPECIE_PET_LABEL: Record<Especie, string> = {
  CACHORRO: "Cachorro",
  GATO: "Gato",
  OUTRO: "Outro",
};

export const SEXO_PET_LABEL: Record<Sexo, string> = {
  MACHO: "Macho",
  FEMEA: "Fêmea",
};

export const MUNICIPIOS_SUGERIDOS = [
  "Vitória",
  "Vila Velha",
  "Serra",
  "Cariacica",
  "Viana",
  "Guarapari",
  "Fundão",
  "Aracruz",
];

/** Normaliza telefone brasileiro para padrão E.164 apenas dígitos (ex: 5527999999999). */
export function sanitizarWhatsappE164(telefone: string): string {
  const digits = telefone.replace(/\D/g, "");
  if (!digits.startsWith("55") && (digits.length === 10 || digits.length === 11)) {
    return `55${digits}`;
  }
  return digits;
}

/** Formata telefone para exibição legível no painel administrativo. */
export function formatarWhatsappVisual(telefone: string): string {
  const digits = telefone.replace(/\D/g, "").replace(/^55/, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return telefone;
}

export interface WhatsappCastracaoParams {
  nomeTutor: string;
  nomePet: string;
  protocolo: string;
  municipio: string;
  tipoServico: TipoServicoPet;
  status: StatusSolicitacaoServico;
  avisoStatus?: string | null;
  dataAgendamento?: Date | string | null;
  localAtendimento?: string | null;
}

/** Gera o texto formatado de atualização de protocolo para envio direto no WhatsApp. */
export function gerarMensagemWhatsappCastracao(
  params: WhatsappCastracaoParams
): string {
  const servicoLabel = SERVICO_CONFIG[params.tipoServico].label;
  const statusInfo = STATUS_SERVICO_CONFIG[params.status];
  const avisoTexto = params.avisoStatus?.trim() || statusInfo.avisoPadrao;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://ong.visaoinfoco.cloud";
  const linkAcompanhamento = `${baseUrl}/castracao?protocolo=${encodeURIComponent(
    params.protocolo
  )}`;

  const linhas = [
    `Olá, *${params.nomeTutor}*! Aqui é da equipe da *ONG Esperança Animal*. 🐾`,
    "",
    `Atualizamos o andamento do pedido de *${servicoLabel}* para o(a) pet *${params.nomePet}* (${params.municipio}):`,
    `📋 *Protocolo:* ${params.protocolo}`,
    `📌 *Novo Status:* ${statusInfo.label}`,
  ];

  if (params.dataAgendamento) {
    const dataFormatada = new Date(params.dataAgendamento).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    linhas.push(`📅 *Data/Horário:* ${dataFormatada}`);
  }

  if (params.localAtendimento?.trim()) {
    linhas.push(`📍 *Local:* ${params.localAtendimento.trim()}`);
  }

  linhas.push("", `💬 *Aviso da Equipe:* ${avisoTexto}`);
  linhas.push("", `Acompanhe seu protocolo no site: ${linkAcompanhamento}`);

  return linhas.join("\n");
}

/** Constrói a URL completa wa.me para abrir o WhatsApp com mensagem preenchida. */
export function gerarLinkWhatsappCastracao(
  whatsapp: string,
  params: WhatsappCastracaoParams
): string {
  const numeroE164 = sanitizarWhatsappE164(whatsapp);
  const mensagem = gerarMensagemWhatsappCastracao(params);
  return `https://wa.me/${numeroE164}?text=${encodeURIComponent(mensagem)}`;
}

