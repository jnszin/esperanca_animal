"use client";

import { useState, useMemo } from "react";
import { AdocaoCardAdmin, SolicitacaoAdocaoData } from "./adocao-card-admin";
import { StatusAdocao } from "@prisma/client";
import { Search, Filter, Heart } from "lucide-react";

export function ListaAdocoesAdmin({
  solicitacoes,
}: {
  solicitacoes: SolicitacaoAdocaoData[];
}) {
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroScore, setFiltroScore] = useState<string>("TODOS");
  const [busca, setBusca] = useState<string>("");

  // Contadores por status para os botões/abas
  const contadores = useMemo(() => {
    return {
      TODOS: solicitacoes.length,
      RECEBIDO: solicitacoes.filter((s) => s.status === StatusAdocao.RECEBIDO).length,
      TRIAGEM_APROVADA: solicitacoes.filter((s) => s.status === StatusAdocao.TRIAGEM_APROVADA).length,
      ENTREVISTA_AGENDADA: solicitacoes.filter((s) => s.status === StatusAdocao.ENTREVISTA_AGENDADA).length,
      APROVADO: solicitacoes.filter((s) => s.status === StatusAdocao.APROVADO).length,
      RECUSADO: solicitacoes.filter((s) => s.status === StatusAdocao.RECUSADO).length,
    };
  }, [solicitacoes]);

  // Filtragem dinâmica
  const solicitacoesFiltradas = useMemo(() => {
    return solicitacoes.filter((s) => {
      // 1. Filtro por Status
      if (filtroStatus !== "TODOS" && s.status !== filtroStatus) {
        return false;
      }

      // 2. Filtro por Score
      if (filtroScore === "ALTO" && s.scoreTriagem < 80) return false;
      if (filtroScore === "MEDIO" && (s.scoreTriagem < 50 || s.scoreTriagem >= 80)) return false;
      if (filtroScore === "BAIXO" && s.scoreTriagem >= 50) return false;

      // 3. Busca Textual
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const nomeAdotante = s.nomeAdotante.toLowerCase();
        const protocolo = s.protocolo.toLowerCase();
        const petNome = s.animal.nome.toLowerCase();
        const cidade = s.cidade.toLowerCase();

        return (
          nomeAdotante.includes(termo) ||
          protocolo.includes(termo) ||
          petNome.includes(termo) ||
          cidade.includes(termo)
        );
      }

      return true;
    });
  }, [solicitacoes, filtroStatus, filtroScore, busca]);

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. BARRA DE BUSCA & FILTRO DE SCORE
      ======================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-neutral-200/80 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por adotante, protocolo, pet ou cidade..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Seletor de Faixa de Score */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500 shrink-0" />
          <select
            value={filtroScore}
            onChange={(e) => setFiltroScore(e.target.value)}
            className="text-xs px-3.5 py-2.5 rounded-2xl border border-neutral-200 bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="TODOS">Todos os Scores de Triagem</option>
            <option value="ALTO">Alta Compatibilidade (80 a 100 pts)</option>
            <option value="MEDIO">Compatibilidade Média (50 a 79 pts)</option>
            <option value="BAIXO">Atenção / Risco (&lt; 50 pts)</option>
          </select>
        </div>
      </div>

      {/* ========================================================
          2. ABAS DE STATUS (PILLS NAVEGÁVEIS)
      ======================================================== */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "TODOS", label: "Todas", count: contadores.TODOS },
          { id: StatusAdocao.RECEBIDO, label: "Pendentes (Recebidas)", count: contadores.RECEBIDO },
          { id: StatusAdocao.TRIAGEM_APROVADA, label: "Triagem Aprovada", count: contadores.TRIAGEM_APROVADA },
          { id: StatusAdocao.ENTREVISTA_AGENDADA, label: "Entrevistas", count: contadores.ENTREVISTA_AGENDADA },
          { id: StatusAdocao.APROVADO, label: "Aprovadas ✓", count: contadores.APROVADO },
          { id: StatusAdocao.RECUSADO, label: "Recusadas", count: contadores.RECUSADO },
        ].map((tab) => {
          const isActive = filtroStatus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltroStatus(tab.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                isActive
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  isActive ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          3. LISTAGEM DE CANDIDATURAS
      ======================================================== */}
      {solicitacoesFiltradas.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-neutral-200/80 text-center space-y-3">
          <div className="w-14 h-14 bg-neutral-100 text-neutral-400 rounded-2xl mx-auto flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-neutral-800">
            Nenhuma solicitação de adoção encontrada
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {busca || filtroStatus !== "TODOS" || filtroScore !== "TODOS"
              ? "Tente ajustar os filtros ou o termo de busca para visualizar outros registros."
              : "Assim que um cidadão preencher o formulário de adoção de um pet na vitrine pública, ele aparecerá aqui com o score calculado."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-neutral-500">
              Exibindo <strong>{solicitacoesFiltradas.length}</strong> de {solicitacoes.length} candidaturas
            </span>
          </div>

          {solicitacoesFiltradas.map((s) => (
            <AdocaoCardAdmin key={s.id} solicitacao={s} />
          ))}
        </div>
      )}
    </div>
  );
}
