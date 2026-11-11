"use client";

import { useState } from "react";
import { ListaAjudasAdmin } from "@/components/lista-ajudas-admin";
import type { OfertaAjudaAdminDTO } from "@/components/ajuda-card-admin";
import { ListaVoluntariosAdmin } from "@/components/lista-voluntarios-admin";
import type { VoluntarioAdminDTO } from "@/components/voluntario-card-admin";
import { HandHeart, HeartHandshake } from "lucide-react";

export type AbaAdminAjudas = "ofertas" | "voluntarios";

interface PainelAjudasTabsProps {
  ofertas: OfertaAjudaAdminDTO[];
  voluntarios: VoluntarioAdminDTO[];
  novasOfertas: number;
  novosVoluntarios: number;
  initialAba?: AbaAdminAjudas;
}

export function PainelAjudasTabs({
  ofertas,
  voluntarios,
  novasOfertas,
  novosVoluntarios,
  initialAba = "ofertas",
}: PainelAjudasTabsProps) {
  const [aba, setAba] = useState<AbaAdminAjudas>(initialAba);

  return (
    <div className="space-y-6">
      <div className="bg-white p-2 rounded-2xl border border-neutral-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setAba("ofertas")}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            aba === "ofertas"
              ? "bg-neutral-900 text-white"
              : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700"
          }`}
        >
          <span className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4" />
            <span>Ofertas de Insumos &amp; Apoio Financeiro</span>
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              novasOfertas > 0
                ? "bg-amber-400 text-amber-950"
                : aba === "ofertas"
                ? "bg-white/20 text-white"
                : "bg-neutral-200 text-neutral-700"
            }`}
          >
            {ofertas.length} ({novasOfertas} novas)
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAba("voluntarios")}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            aba === "voluntarios"
              ? "bg-neutral-900 text-white"
              : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700"
          }`}
        >
          <span className="flex items-center gap-2">
            <HandHeart className="w-4 h-4" />
            <span>Voluntários (Passeios, LT &amp; Personalizado)</span>
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              novosVoluntarios > 0
                ? "bg-emerald-400 text-emerald-950"
                : aba === "voluntarios"
                ? "bg-white/20 text-white"
                : "bg-neutral-200 text-neutral-700"
            }`}
          >
            {voluntarios.length} ({novosVoluntarios} novos)
          </span>
        </button>
      </div>

      {aba === "ofertas" ? (
        <ListaAjudasAdmin items={ofertas} />
      ) : (
        <ListaVoluntariosAdmin items={voluntarios} />
      )}
    </div>
  );
}

