"use client";

import { useState } from "react";
import { Especie, Porte } from "@prisma/client";
import { AlertTriangle } from "lucide-react";
import {
  formatarEspecieBadge,
  formatarPorteAnimal,
  obterFaixaEtariaAnimal,
} from "@/lib/animal-labels";

interface GaleriaAnimalProps {
  nome: string;
  especie: Especie;
  porte: Porte;
  idadeEstimadaMeses: number;
  exigeTelaProtecao: boolean;
  fotos: { id: string; url: string }[];
}

const FALLBACK_FOTO =
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800";

export function GaleriaAnimal({
  nome,
  especie,
  porte,
  idadeEstimadaMeses,
  exigeTelaProtecao,
  fotos,
}: GaleriaAnimalProps) {
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const listaFotos =
    fotos.length > 0 ? fotos : [{ id: "fallback", url: FALLBACK_FOTO }];
  const fotoAtual = listaFotos[indiceAtivo]?.url || listaFotos[0].url;
  const faixa = obterFaixaEtariaAnimal(idadeEstimadaMeses);

  return (
    <div className="space-y-4">
      <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-neutral-100 shadow-md border border-neutral-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fotoAtual}
          alt={nome}
          className="w-full h-full object-cover"
        />

        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
          <span className="bg-white/95 backdrop-blur-xs text-neutral-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {formatarEspecieBadge(especie)} • {formatarPorteAnimal(porte)}
          </span>
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm ${faixa.badgeClass}`}
          >
            {faixa.labelSingular}
          </span>
        </div>

        {exigeTelaProtecao && (
          <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Exige Telas de Proteção</span>
          </div>
        )}
      </div>

      {listaFotos.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {listaFotos.map((foto, index) => {
            const selecionada = index === indiceAtivo;
            return (
              <button
                key={foto.id}
                type="button"
                onClick={() => setIndiceAtivo(index)}
                aria-label={`Ver foto ${index + 1} de ${nome}`}
                className={`aspect-square rounded-2xl overflow-hidden bg-neutral-100 border-2 transition cursor-pointer ${
                  selecionada
                    ? "border-emerald-600 ring-2 ring-emerald-500/30"
                    : "border-neutral-200 hover:border-neutral-400 opacity-85 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto.url}
                  alt={`Foto ${index + 1} de ${nome}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

