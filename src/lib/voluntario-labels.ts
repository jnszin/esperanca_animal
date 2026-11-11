import type {
  ModalidadeVoluntariado,
  StatusVoluntario,
} from "@prisma/client";
import { sanitizarWhatsappE164 } from "@/lib/utils";

export const MODALIDADE_VOLUNTARIADO_CONFIG: Record<
  ModalidadeVoluntariado,
  {
    label: string;
    shortLabel: string;
    descricao: string;
    badge: string;
    placeholderDescricao: string;
  }
> = {
  PASSEIOS: {
    label: "Passeios aos Animais",
    shortLabel: "Passeios",
    descricao:
      "Levar cães acolhidos para caminhar, gastar energia e socializar com segurança.",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-200",
    placeholderDescricao:
      "Conte se já tem experiência com cães, se prefere porte pequeno/médio/grande e em qual região consegue passear...",
  },
  LAR_TEMPORARIO: {
    label: "Lar Temporário (LT)",
    shortLabel: "Lar Temporário",
    descricao:
      "Acolher temporariamente um animal resgatado em casa enquanto a ONG providencia cuidados e adoção definitiva.",
    badge: "bg-amber-100 text-amber-900 border-amber-200",
    placeholderDescricao:
      "Informe se mora em casa murada ou apartamento telado, se já possui outros animais ou crianças e se pode acolher cão ou gato...",
  },
  PERSONALIZADO: {
    label: "Voluntariado Personalizado",
    shortLabel: "Personalizado",
    descricao:
      "Explique livremente de que outra forma consegue ajudar (carona veterinária, banho, divulgação, feiras ou serviços).",
    badge: "bg-purple-100 text-purple-900 border-purple-200",
    placeholderDescricao:
      "Ex: Olá equipe, consigo ajudar levando animais em consultas no carro, ajudando nos banhos ou fotografando pets para adoção...",
  },
};

export const IDEIAS_DISPONIBILIDADE: string[] = [
  "Finais de semana (Sábado e/ou Domingo)",
  "Manhãs (Segunda a Sexta)",
  "Tardes (Segunda a Sexta)",
  "Noites / Horário flexível",
  "Tempo integral para Lar Temporário",
];

export const STATUS_VOLUNTARIO_CONFIG: Record<
  StatusVoluntario,
  { label: string; badge: string; border: string }
> = {
  NOVO: {
    label: "Novo Cadastro",
    badge: "bg-amber-100 text-amber-900 border-amber-200",
    border: "border-l-4 border-l-amber-500",
  },
  EM_CONTATO: {
    label: "Em Contato",
    badge: "bg-blue-100 text-blue-900 border-blue-200",
    border: "border-l-4 border-l-blue-500",
  },
  ATIVO: {
    label: "Voluntário Ativo / Confirmado",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-200",
    border: "border-l-4 border-l-emerald-600",
  },
  INATIVO: {
    label: "Indisponível no Momento",
    badge: "bg-neutral-100 text-neutral-700 border-neutral-300",
    border: "border-l-4 border-l-neutral-400",
  },
};

export interface WhatsappVoluntarioParams {
  nome: string;
  protocolo: string;
  modalidade: ModalidadeVoluntariado;
  municipio: string;
  disponibilidade: string;
  observacaoEquipe?: string | null;
}

/** Gera link wa.me pré-preenchido para responder ao voluntário pelo WhatsApp. */
export function gerarLinkWhatsappVoluntario(
  whatsapp: string,
  params: WhatsappVoluntarioParams
): string {
  const numeroE164 = sanitizarWhatsappE164(whatsapp);
  const modalidadeLabel = MODALIDADE_VOLUNTARIADO_CONFIG[params.modalidade].label;

  const linhas = [
    `Olá, *${params.nome}*! Aqui é da equipe da *ONG Esperança Animal*. 🐾`,
    "",
    `Recebemos seu cadastro como voluntário(a) na modalidade *${modalidadeLabel}* (Protocolo *${params.protocolo}*).`,
    `📍 *Município:* ${params.municipio}`,
    `🗓️ *Disponibilidade:* ${params.disponibilidade}`,
  ];

  if (params.observacaoEquipe?.trim()) {
    linhas.push("", `💬 ${params.observacaoEquipe.trim()}`);
  } else {
    linhas.push(
      "",
      "Muito obrigado pela disposição em ajudar nossos resgatados! Podemos alinhar os próximos passos por aqui?"
    );
  }

  return `https://wa.me/${numeroE164}?text=${encodeURIComponent(linhas.join("\n"))}`;
}

