import type { StatusAcolhimento } from "@prisma/client";
import { sanitizarWhatsappE164 } from "@/lib/utils";

export interface CanalPrefeituraInfo {
  municipio: string;
  canalPrincipal: string;
  caesEGatos: string;
  grandePorte: string;
  observacao: string;
  badgeClass: string;
}

/**
 * Canais municipais verificados nos portais oficiais (.es.gov.br) para orientação
 * sobre abertura de protocolo antes ou em paralelo ao registro no projeto.
 */
export const CANAIS_PREFEITURAS_RESGATE: CanalPrefeituraInfo[] = [
  {
    municipio: "Vitória",
    canalPrincipal: "Telefone 156 • App Vitória Online / Portal 156",
    caesEGatos:
      "Atropelados com gravidade ou risco à saúde pública (CVSA) e denúncias de maus-tratos (Semmam/GBEA via 156 ou Portal de Bem-Estar Animal). Animais sadios não são recolhidos.",
    grandePorte: "Solicitações e ocorrências em via pública via 156.",
    observacao: "Atropelados graves: avaliação em até 24h.",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  {
    municipio: "Vila Velha",
    canalPrincipal:
      "Ouvidoria 162 • (27) 3149-7336 / 0800 283 9059 • Ouvidoria Online",
    caesEGatos:
      "Resgate de cães e gatos em sofrimento extremo/vulnerabilidade e maus-tratos (SEMMA — categoria Animais BEA na Ouvidoria).",
    grandePorte:
      "Cavalos e animais de grande porte soltos ou em maus-tratos via Ouvidoria 162 / portal.",
    observacao: "Atendimento telefônico: Seg a Sex, 7h às 21h.",
    badgeClass: "bg-sky-100 text-sky-900 border-sky-200",
  },
  {
    municipio: "Serra",
    canalPrincipal:
      "Cães/Gatos: WhatsApp (27) 98166-0447 ou App Colab • Grande porte: (27) 3011-6909",
    caesEGatos:
      "Programa ARCA / Semma no WhatsApp (27) 98166-0447 (8h às 18h, enviar fotos e local) ou App Colab. Dúvidas Bem-Estar Animal: (27) 3291-2399.",
    grandePorte:
      "Exclusivo para animais de grande porte (cavalos, bois) soltos em vias: (27) 3011-6909 (24h) ou WhatsApp (27) 99923-4312 / (27) 99687-9023.",
    observacao: "Na BR-101, acionar a ECO101 pelo 0800 77 01 101.",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-200",
  },
  {
    municipio: "Cariacica",
    canalPrincipal:
      "Ouvidoria 162 • Bem-Estar (27) 3354-5406 • Grande porte: (27) 99607-6401",
    caesEGatos:
      "Maus-tratos/abandono na Ouvidoria 162 (todos os dias, 8h às 20h). Bem-Estar Animal (Semdec): (27) 3354-5406 / (27) 98819-2886. Zoonoses: (27) 3354-7032.",
    grandePorte:
      "Recolhimento de animais de médio e grande porte soltos em ruas (Semserv 24h): (27) 99607-6401.",
    observacao: "Guarde o número de protocolo informado pela Ouvidoria.",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-200",
  },
];

export const STATUS_CHAMADO_LABEL: Record<StatusAcolhimento, string> = {
  PENDENTE_ANALISE: "Pendente de Análise",
  EM_DESLOCAMENTO: "Em Deslocamento / Atendimento",
  RESGATADO: "Animal Resgatado",
  ENCAMINHADO_TERCEIROS: "Encaminhado a Parceiros / Prefeitura",
  FINALIZADO_SEM_RESGATE: "Finalizado s/ Resgate",
};

export interface WhatsappChamadoParams {
  nomeSolicitante: string;
  protocolo: string;
  cidade: string;
  status: StatusAcolhimento;
  parecerONG?: string | null;
}

/** Gera link wa.me para a administradora responder diretamente ao solicitante do resgate. */
export function gerarLinkWhatsappChamado(
  whatsapp: string,
  params: WhatsappChamadoParams
): string {
  const numeroE164 = sanitizarWhatsappE164(whatsapp);
  const statusLabel = STATUS_CHAMADO_LABEL[params.status];

  const linhas = [
    `Olá, *${params.nomeSolicitante}*! Aqui é da equipe do *Projeto Esperança Animal*. 🐾`,
    "",
    `Sobre o chamado de resgate *${params.protocolo}* (${params.cidade}):`,
    `📌 *Status atual:* ${statusLabel}`,
  ];

  if (params.parecerONG?.trim()) {
    linhas.push("", `💬 *Retorno da equipe:* ${params.parecerONG.trim()}`);
  } else {
    linhas.push(
      "",
      "Estamos acompanhando a ocorrência e gostaríamos de confirmar alguns detalhes com você."
    );
  }

  return `https://wa.me/${numeroE164}?text=${encodeURIComponent(linhas.join("\n"))}`;
}

