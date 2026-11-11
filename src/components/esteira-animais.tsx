"use client";

import { useRef } from "react";
import Link from "next/link";
import { Especie, Porte, Sexo } from "@prisma/client";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import {
  formatarEspecieBadge,
  formatarIdadeAproximada,
  formatarPorteAnimal,
} from "@/lib/animal-labels";

export interface AnimalEsteira {
  id: string;
  nome: string;
  slug: string;
  especie: Especie;
  raca: string;
  porte: Porte;
  sexo: Sexo;
  idadeEstimadaMeses: number;
  historia: string;
  temperamento: string[];
  fotos: { url: string }[];
}

export function EsteiraAnimais({ animais }: { animais: AnimalEsteira[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!animais || animais.length === 0) {
    return null;
  }

  // Duplicamos a lista para criar a esteira infinita perfeita sem interrupção
  const listaEsteira = [...animais, ...animais];

  function scrollManual(direcao: "left" | "right") {
    if (!containerRef.current) return;
    const distancia = 360;
    containerRef.current.scrollBy({
      left: direcao === "left" ? -distancia : distancia,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative group">
      {/* Controles de Navegação Manual */}
      <div className="flex items-center justify-end mb-4 px-4 sm:px-0 gap-2">
        <button
          type="button"
          onClick={() => scrollManual("left")}
          aria-label="Rolar para esquerda"
          className="w-9 h-9 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 shadow-sm border border-neutral-200 flex items-center justify-center transition active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollManual("right")}
          aria-label="Rolar para direita"
          className="w-9 h-9 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 shadow-sm border border-neutral-200 flex items-center justify-center transition active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Trilho da Esteira (Overflow hidden com animação contínua) */}
      <div
        ref={containerRef}
        className="overflow-x-auto no-scrollbar py-4"
      >
        <div className="animacao-esteira flex gap-6">
          {listaEsteira.map((animal, index) => {
            const fotoUrl =
              animal.fotos[0]?.url ||
              "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800";

            return (
              <div
                key={`${animal.id}-${index}`}
                className="w-72 sm:w-80 shrink-0 bg-white rounded-3xl border border-neutral-200/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group/card select-none"
              >
                {/* Foto do Pet com Zoom Suave */}
                <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fotoUrl}
                    alt={animal.nome}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-neutral-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-neutral-200/60">
                    {formatarEspecieBadge(animal.especie)} •{" "}
                    {formatarPorteAnimal(animal.porte)}
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-xl font-black text-neutral-900 group-hover/card:text-emerald-700 transition">
                        {animal.nome}
                      </h3>
                      <span className="text-xs font-semibold text-neutral-500">
                        {animal.sexo === "MACHO" ? "Macho" : "Fêmea"} • ~
                        {formatarIdadeAproximada(animal.idadeEstimadaMeses)}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                      {animal.historia}
                    </p>

                    {/* Tags de Temperamento */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {animal.temperamento.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-neutral-100 text-neutral-700 border border-neutral-200/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Botão de Ação */}
                  <Link
                    href={`/animais/${animal.slug}`}
                    className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition duration-200 shadow-2xs group-hover/card:bg-emerald-600 group-hover/card:text-white"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>Conhecer {animal.nome}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

