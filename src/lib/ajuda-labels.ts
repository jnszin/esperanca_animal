import type {
  FormaEntregaAjuda,
  StatusOfertaAjuda,
  TipoAjudaONG,
} from "@prisma/client";
import { sanitizarWhatsappE164 } from "@/lib/utils";

export const TIPO_AJUDA_CONFIG: Record<
  TipoAjudaONG,
  { label: string; descricao: string; badge: string }
> = {
  RACAO: {
    label: "Ração Animal",
    descricao: "Ração para cães, gatos ou filhotes, pacotes ou sobras conservadas",
    badge: "bg-amber-100 text-amber-900 border-amber-200",
  },
  HIGIENE_LIMPEZA: {
    label: "Higiene & Limpeza",
    descricao: "Shampoos para cães e gatos, sabonetes, tapetes e desinfetantes",
    badge: "bg-sky-100 text-sky-900 border-sky-200",
  },
  MEDICAMENTOS: {
    label: "Medicamentos & Saúde",
    descricao: "Vermífugos, antipulgas, gases, soro e itens dentro da validade",
    badge: "bg-red-100 text-red-900 border-red-200",
  },
  ACESSORIOS: {
    label: "Acessórios & Conforto",
    descricao: "Cobertores, toalhas, potes, coleiras, caminhas e caixas",
    badge: "bg-purple-100 text-purple-900 border-purple-200",
  },
  FINANCEIRO: {
    label: "Ajuda Financeira",
    descricao: "Apoio em dinheiro, vaquinha ou apadrinhamento veterinário",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  VOLUNTARIADO_TRANSPORTE: {
    label: "Carona & Apoio Prático",
    descricao: "Ajuda com transporte ao veterinário, lar temporário ou serviços",
    badge: "bg-teal-100 text-teal-900 border-teal-200",
  },
  OUTROS: {
    label: "Outra Forma de Ajuda",
    descricao: "Qualquer outro material ou apoio que queira oferecer à ONG",
    badge: "bg-neutral-100 text-neutral-800 border-neutral-300",
  },
};

export const IDEIAS_MENSAGENS_AJUDA: {
  titulo: string;
  tipo: TipoAjudaONG;
  texto: string;
}[] = [
  {
    titulo: "Ração sobrando aqui",
    tipo: "RACAO",
    texto:
      "Olá equipe! Consigo ajudar com ração animal pois tenho sobrando aqui em casa e gostaria de doar para os cães e gatos da ONG.",
  },
  {
    titulo: "Shampoos p/ cães e gatos",
    tipo: "HIGIENE_LIMPEZA",
    texto:
      "Olá equipe! Consigo ajudar com shampoos de lavagem para cães e gatos e itens de higiene para os banhos dos animais resgatados.",
  },
  {
    titulo: "Remédios ou antipulgas",
    tipo: "MEDICAMENTOS",
    texto:
      "Olá equipe! Tenho medicamentos/antipulgas veterinários dentro do prazo de validade disponíveis para doar à ONG.",
  },
  {
    titulo: "Cobertores e acessórios",
    tipo: "ACESSORIOS",
    texto:
      "Olá equipe! Consigo doar cobertores, toalhas, potes de água ou caminhas em ótimo estado para ajudar no abrigo.",
  },
  {
    titulo: "Carona ou apoio prático",
    tipo: "VOLUNTARIADO_TRANSPORTE",
    texto:
      "Olá equipe! Gostaria de ajudar oferecendo transporte solidário para consultas veterinárias ou apoio em ações da ONG.",
  },
  {
    titulo: "Contribuição financeira",
    tipo: "FINANCEIRO",
    texto:
      "Olá equipe! Gostaria de ajudar com uma doação financeira para apoiar os gastos com alimentação, castrações ou tratamentos.",
  },
];

export const FORMA_ENTREGA_CONFIG: Record<FormaEntregaAjuda, string> = {
  POSSO_ENTREGAR: "Posso entregar em ponto combinado",
  PRECISO_RETIRADA: "Preciso que a equipe retire, se possível",
  A_COMBINAR: "Combinar pelo WhatsApp",
};

export const STATUS_AJUDA_CONFIG: Record<
  StatusOfertaAjuda,
  { label: string; badge: string; border: string }
> = {
  NOVO: {
    label: "Nova Oferta",
    badge: "bg-amber-100 text-amber-900 border-amber-200",
    border: "border-l-4 border-l-amber-500",
  },
  EM_CONTATO: {
    label: "Em Contato no WhatsApp",
    badge: "bg-blue-100 text-blue-900 border-blue-200",
    border: "border-l-4 border-l-blue-500",
  },
  RECEBIDO_AGRADECIDO: {
    label: "Recebida & Agradecida",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-200",
    border: "border-l-4 border-l-emerald-600",
  },
  ARQUIVADO: {
    label: "Arquivada",
    badge: "bg-neutral-100 text-neutral-700 border-neutral-300",
    border: "border-l-4 border-l-neutral-400",
  },
};

export function gerarLinkWhatsappAjuda(
  whatsapp: string,
  params: {
    nomeDoador: string;
    protocolo: string;
    tipoAjuda: TipoAjudaONG;
    municipio: string;
    observacaoEquipe?: string | null;
  }
): string {
  const numero = sanitizarWhatsappE164(whatsapp);
  const categoria = TIPO_AJUDA_CONFIG[params.tipoAjuda].label;
  const linhas = [
    `Olá, *${params.nomeDoador}*! Muito obrigado pelo carinho com os animais da *ONG Esperança Animal*. 🐾`,
    "",
    `Recebemos sua oferta de ajuda (*${categoria}*) referente ao protocolo *${params.protocolo}* (${params.municipio}).`,
  ];

  if (params.observacaoEquipe?.trim()) {
    linhas.push("", `💬 *Mensagem da equipe:* ${params.observacaoEquipe.trim()}`);
  } else {
    linhas.push("", "Podemos combinar por aqui a melhor forma para recebermos sua ajuda?");
  }

  return `https://wa.me/${numero}?text=${encodeURIComponent(linhas.join("\n"))}`;
}

