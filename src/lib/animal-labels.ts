import type { Especie, Porte, Prisma } from "@prisma/client";

export const CONTATO_ONG_ADOCAO = {
  whatsappE164: "5527992814152",
  whatsappVisual: "(27) 99281-4152",
  email: "Danny-j-o@hotmail.com",
  regiaoAtendimento: "Vitória e Grande Vitória, ES",
} as const;

export type FaixaEtariaFiltro = "FILHOTE" | "ADULTO" | "IDOSO";

export interface FaixaEtariaConfig {
  id: FaixaEtariaFiltro;
  label: string;
  labelSingular: string;
  descricao: string;
  whereMeses: Prisma.IntFilter<"Animal">;
  badgeClass: string;
}

export const FAIXAS_ETARIAS_MAP: Record<FaixaEtariaFiltro, FaixaEtariaConfig> = {
  FILHOTE: {
    id: "FILHOTE",
    label: "Filhotes",
    labelSingular: "Filhote",
    descricao: "Até 11 meses",
    whereMeses: { lt: 12 },
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
  },
  ADULTO: {
    id: "ADULTO",
    label: "Adultos",
    labelSingular: "Adulto",
    descricao: "1 a 6 anos",
    whereMeses: { gte: 12, lt: 84 },
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  IDOSO: {
    id: "IDOSO",
    label: "Idosos",
    labelSingular: "Idoso",
    descricao: "7 anos ou mais",
    whereMeses: { gte: 84 },
    badgeClass: "bg-amber-50 text-amber-900 border-amber-200",
  },
};

export const FAIXAS_ETARIAS_LISTA: FaixaEtariaConfig[] = [
  FAIXAS_ETARIAS_MAP.FILHOTE,
  FAIXAS_ETARIAS_MAP.ADULTO,
  FAIXAS_ETARIAS_MAP.IDOSO,
];

export const PORTES_LABEL_MAP: Record<Porte, { curto: string; completo: string }> = {
  PEQUENO: { curto: "Pequeno", completo: "Porte Pequeno" },
  MEDIO: { curto: "Médio", completo: "Porte Médio" },
  GRANDE: { curto: "Grande", completo: "Porte Grande" },
};

export function isFaixaEtariaValida(
  valor: string | undefined
): valor is FaixaEtariaFiltro {
  return valor === "FILHOTE" || valor === "ADULTO" || valor === "IDOSO";
}

export function obterFaixaEtariaAnimal(idadeMeses: number): FaixaEtariaConfig {
  if (idadeMeses < 12) return FAIXAS_ETARIAS_MAP.FILHOTE;
  if (idadeMeses < 84) return FAIXAS_ETARIAS_MAP.ADULTO;
  return FAIXAS_ETARIAS_MAP.IDOSO;
}

/** Formata idade estimada em meses para exibição humana (ex: "6 meses", "2 anos e 3 meses"). */
export function formatarIdadeAproximada(idadeMeses: number): string {
  if (idadeMeses < 12) {
    return idadeMeses === 1 ? "1 mês" : `${idadeMeses} meses`;
  }

  const anos = Math.floor(idadeMeses / 12);
  const mesesRestantes = idadeMeses % 12;
  const textoAno = anos === 1 ? "1 ano" : `${anos} anos`;

  if (mesesRestantes === 0) return textoAno;
  const textoMes = mesesRestantes === 1 ? "1 mês" : `${mesesRestantes} meses`;
  return `${textoAno} e ${textoMes}`;
}

export function formatarPorteAnimal(
  porte: Porte,
  formato: "completo" | "curto" = "completo"
): string {
  return PORTES_LABEL_MAP[porte][formato];
}

export function formatarEspecieBadge(especie: Especie): string {
  if (especie === "CACHORRO") return "🐶 Cão";
  if (especie === "GATO") return "🐱 Gato";
  return "🐾 Pet";
}

export function gerarLinkWhatsappInteresseAnimal(params: {
  nome: string;
  porte: Porte;
  idadeEstimadaMeses: number;
}): string {
  const porteTexto = formatarPorteAnimal(params.porte).toLowerCase();
  const idadeTexto = formatarIdadeAproximada(params.idadeEstimadaMeses);
  const msg = encodeURIComponent(
    `Olá! Vi a ficha do pet *${params.nome}* (${porteTexto}, aprox. ${idadeTexto}) no portal da Esperança Animal e gostaria de mais informações sobre a adoção.`
  );
  return `https://wa.me/${CONTATO_ONG_ADOCAO.whatsappE164}?text=${msg}`;
}

export function montarUrlFiltroAnimais(filtros: {
  especie?: string;
  faixa?: string;
  porte?: string;
}): string {
  const query = new URLSearchParams();
  if (filtros.especie) query.set("especie", filtros.especie);
  if (filtros.faixa) query.set("faixa", filtros.faixa);
  if (filtros.porte) query.set("porte", filtros.porte);
  const qs = query.toString();
  return qs ? `/animais?${qs}` : "/animais";
}

