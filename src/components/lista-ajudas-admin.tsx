"use client";

import { useMemo, useState } from "react";
import {
  AjudaCardAdmin,
  type OfertaAjudaAdminDTO,
} from "@/components/ajuda-card-admin";
import { STATUS_AJUDA_CONFIG, TIPO_AJUDA_CONFIG } from "@/lib/ajuda-labels";
import type { StatusOfertaAjuda, TipoAjudaONG } from "@prisma/client";
import { Filter, HeartHandshake, Search } from "lucide-react";

export function ListaAjudasAdmin({ items }: { items: OfertaAjudaAdminDTO[] }) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [filtroMunicipio, setFiltroMunicipio] = useState("TODOS");

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
      if (filtroStatus !== "TODOS" && item.status !== filtroStatus) {
        return false;
      }
      if (filtroTipo !== "TODOS" && item.tipoAjuda !== filtroTipo) {
        return false;
      }
      if (
        filtroMunicipio !== "TODOS" &&
        item.municipio.trim() !== filtroMunicipio
      ) {
        return false;
      }
      if (!q) return true;
      return (
        item.protocolo.toLowerCase().includes(q) ||
        item.nomeDoador.toLowerCase().includes(q) ||
        item.mensagem.toLowerCase().includes(q) ||
        item.municipio.toLowerCase().includes(q)
      );
    });
  }, [items, busca, filtroStatus, filtroTipo, filtroMunicipio]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-neutral-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar protocolo, nome, item..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="TODOS">Todas as Categorias</option>
          {(Object.keys(TIPO_AJUDA_CONFIG) as TipoAjudaONG[]).map((tp) => (
            <option key={tp} value={tp}>
              {TIPO_AJUDA_CONFIG[tp].label}
            </option>
          ))}
        </select>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="TODOS">Todos os Status</option>
          {(Object.keys(STATUS_AJUDA_CONFIG) as StatusOfertaAjuda[]).map((st) => (
            <option key={st} value={st}>
              {STATUS_AJUDA_CONFIG[st].label}
            </option>
          ))}
        </select>

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
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 px-1">
        <Filter className="w-3.5 h-3.5" />
        <span>
          Exibindo {filtrados.length} de {items.length} oferta(s) de ajuda
        </span>
      </div>

      {filtrados.length > 0 ? (
        <div className="space-y-4">
          {filtrados.map((item) => (
            <AjudaCardAdmin key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-neutral-300 text-center space-y-2">
          <HeartHandshake className="w-8 h-8 text-neutral-300 mx-auto" />
          <p className="text-sm font-bold text-neutral-700">
            Nenhuma oferta encontrada com os filtros atuais.
          </p>
          <p className="text-xs text-neutral-500">
            Quando apoiadores enviarem ofertas pela aba Ajude do site, elas aparecerão
            aqui.
          </p>
        </div>
      )}
    </div>
  );
}

