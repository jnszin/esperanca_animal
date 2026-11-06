import { TipoMoradia, StatusAdocao, Animal } from "@prisma/client";

export interface DadosTriagemInput {
  tipoMoradia: TipoMoradia;
  imovelProprio: boolean;
  proprietarioPermite: boolean;
  todosConcordam: boolean;
  possuiOutrosAnimais: boolean;
  horasAnimalSozinho: number;
  cienteCustosMensais: boolean;
}

export interface ResultadoTriagem {
  scoreTriagem: number; // 0 a 100
  observacoesSistema: string;
  statusSugerido: StatusAdocao;
}

/**
 * Motor de Avaliação Automatizada de Adoção.
 * Cruza o perfil do animal com o questionário estruturado do adotante.
 */
export function calcularScoreTriagem(
  animal: Pick<Animal, "exigeTelaProtecao" | "porte" | "especie">,
  dados: DadosTriagemInput
): ResultadoTriagem {
  let score = 0;
  const observacoes: string[] = [];

  // ========================================================
  // 1. REGRA DE SEGURANÇA: TELAS DE PROTEÇÃO & TIPO DE MORADIA (Até 30 pts)
  // ========================================================
  const isAptoSemTela = dados.tipoMoradia === TipoMoradia.APARTAMENTO_SEM_TELA;
  const isAptoTelado = dados.tipoMoradia === TipoMoradia.APARTAMENTO_TELADO;
  const isCasaFechada = dados.tipoMoradia === TipoMoradia.CASA_QUINTAL_FECHADO;
  const isCasaAberta = dados.tipoMoradia === TipoMoradia.CASA_QUINTAL_ABERTO;

  if (animal.exigeTelaProtecao) {
    if (isAptoSemTela) {
      score -= 30;
      observacoes.push("ALERTA CRÍTICO: Animal exige tela de proteção e o adotante reside em apartamento sem tela.");
    } else if (isAptoTelado || isCasaFechada) {
      score += 30;
      observacoes.push("Ambiente seguro e telado compatível com a exigência do animal.");
    } else if (isCasaAberta) {
      score += 10;
      observacoes.push("Atenção: Casa com quintal aberto para animal que exige contenção/telas.");
    } else {
      score += 20;
    }
  } else {
    if (isCasaFechada || isAptoTelado) {
      score += 30;
    } else if (isCasaAberta) {
      score += 20;
    } else {
      score += 15;
    }
  }

  // ========================================================
  // 2. CONCORDÂNCIA FAMILIAR & AMBIENTE (Até 25 pts)
  // ========================================================
  if (dados.todosConcordam) {
    score += 25;
  } else {
    score -= 20;
    observacoes.push("ALERTA: Nem todos os moradores da residência estão de acordo com a adoção (risco de devolução).");
  }

  // ========================================================
  // 3. REGRA DO IMÓVEL (Até 15 pts)
  // ========================================================
  if (dados.imovelProprio) {
    score += 15;
  } else {
    if (dados.proprietarioPermite) {
      score += 15;
      observacoes.push("Imóvel alugado com autorização expressa do locador.");
    } else {
      score -= 25;
      observacoes.push("ALERTA GRAVE: Imóvel alugado onde o proprietário NÃO permite animais.");
    }
  }

  // ========================================================
  // 4. ROTINA & TEMPO SOZINHO (Até 15 pts)
  // ========================================================
  if (dados.horasAnimalSozinho <= 4) {
    score += 15;
  } else if (dados.horasAnimalSozinho <= 8) {
    score += 10;
  } else {
    score += 5;
    observacoes.push(`Atenção: Animal ficará sozinho por cerca de ${dados.horasAnimalSozinho} horas diárias.`);
  }

  // ========================================================
  // 5. CONSCIÊNCIA FINANCEIRA (Até 15 pts)
  // ========================================================
  if (dados.cienteCustosMensais) {
    score += 15;
  } else {
    score -= 10;
    observacoes.push("Adotante não confirmou ciência dos custos veterinários e alimentares mensais.");
  }

  // Normalização do score entre 0 e 100
  const scoreFinal = Math.max(0, Math.min(100, score));

  // Determinação do status inicial sugerido para a triagem
  let statusSugerido: StatusAdocao = StatusAdocao.RECEBIDO;
  if (scoreFinal >= 75) {
    statusSugerido = StatusAdocao.TRIAGEM_APROVADA;
  } else if (scoreFinal < 40 || (animal.exigeTelaProtecao && isAptoSemTela)) {
    statusSugerido = StatusAdocao.RECEBIDO; // Mantém recebido para avaliação criteriosa humana
  }

  return {
    scoreTriagem: scoreFinal,
    observacoesSistema: observacoes.join(" | "),
    statusSugerido,
  };
}

