"use client";

import { useMemo, useState } from "react";
import {
  CastracaoCardAdmin,
  type CastracaoAdminDTO,
} from "@/components/castracao-card-admin";
import {
  SERVICO_CONFIG,
  STATUS_SERVICO_CONFIG,
} from "@/lib/castracao-labels";
import type { StatusSolicitacaoServico, TipoServicoPet } from "@prisma/client";
import { Filter, Search, Syringe } from "lucide-react";

export function ListaCastracoesAdmin({
  items,
}: {
  items: CastracaoAdminDTO[];
}) {
  const [busca, setBusca] = useState("");
  const [filtroMunicipio, setFiltroMunicipio] = useState("TODOS");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroServico, setFiltroServico] = useState<string>("TODOS");

  const municipiosUnicos = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.municipio?.trim()) {
        set.add(item.municipio.trim());
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [items]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return items.filter((item) => {
      if (filtroMunicipio !== "TODOS" && item.municipio.trim() !== filtroMunicipio) {
        return false;
      }
      if (filtroStatus !== "TODOS" && item.status !== filtroStatus) {
        return false;
      }
      if (filtroServico !== "TODOS" && item.tipoServico !== filtroServico) {
        return false;
      }
      if (!q) return true;
      return (
        item.protocolo.toLowerCase().includes(q) ||
        item.nomeTutor.toLowerCase().includes(q) ||
        item.nomePet.toLowerCase().includes(q) ||
        item.bairro.toLowerCase().includes(q) ||
        item.municipio.toLowerCase().includes(q)
      );
    });
  }, [items, busca, filtroMunicipio, filtroStatus, filtroServico]);

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-neutral-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar protocolo, tutor, pet..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={filtroMunicipio}
          onChange={(e) => setFiltroMunicipio(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="TODOS">Todos os Municípios</option>
          {municipiosUnicos.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="TODOS">Todos os Status</option>
          {(Object.keys(STATUS_SERVICO_CONFIG) as StatusSolicitacaoServico[]).map(
            (st) => (
              <option key={st} value={st}>
                {STATUS_SERVICO_CONFIG[st].label}
              </option>
            )
          )}
        </select>

        <select
          value={filtroServico}
          onChange={(e) => setFiltroServico(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="TODOS">Todos os Serviços</option>
          {(Object.keys(SERVICO_CONFIG) as TipoServicoPet[]).map((tp) => (
            <option key={tp} value={tp}>
              {SERVICO_CONFIG[tp].label}
            </option>
          ))}
        </select>
      </div>

      {/* Contagem */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 px-1">
        <Filter className="w-3.5 h-3.5" />
        <span>
          Exibindo {filtrados.length} de {items.length} solicitação(ões)
        </span>
      </div>

      {/* Lista */}
      {filtrados.length > 0 ? (
        <div className="space-y-4">
          {filtrados.map((item) => (
            <CastracaoCardAdmin key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-neutral-300 text-center space-y-2">
          <Syringe className="w-8 h-8 text-neutral-300 mx-auto" />
          <p className="text-sm font-bold text-neutral-700">
            Nenhuma solicitação encontrada para os filtros selecionados.
          </p>
          <p className="text-xs text-neutral-500">
            Quando tutores preencherem o formulário de castração/vacinação no site, os
            registros aparecerão aqui.
          </p>
        </div>
      )}
    </div>
  );
}

