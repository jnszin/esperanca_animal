"use client";

import { useState, useMemo } from "react";
import { AnimalCardAdmin, AnimalAdminData } from "./animal-card-admin";
import { StatusAnimal, Especie } from "@prisma/client";
import { Search, Filter, Plus, PawPrint } from "lucide-react";
import Link from "next/link";

export function ListaAnimaisAdmin({ animais }: { animais: AnimalAdminData[] }) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroEspecie, setFiltroEspecie] = useState<string>("TODAS");

  const contadores = useMemo(() => {
    return {
      TODOS: animais.length,
      DISPONIVEL: animais.filter((a) => a.status === StatusAnimal.DISPONIVEL).length,
      EM_PROCESSO: animais.filter((a) => a.status === StatusAnimal.EM_PROCESSO).length,
      EM_TRATAMENTO: animais.filter((a) => a.status === StatusAnimal.EM_TRATAMENTO).length,
      ADOTADO: animais.filter((a) => a.status === StatusAnimal.ADOTADO).length,
    };
  }, [animais]);

  const animaisFiltrados = useMemo(() => {
    return animais.filter((a) => {
      // 1. Status
      if (filtroStatus !== "TODOS" && a.status !== filtroStatus) {
        return false;
      }

      // 2. Espécie
      if (filtroEspecie !== "TODAS" && a.especie !== filtroEspecie) {
        return false;
      }

      // 3. Busca textual
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const nome = a.nome.toLowerCase();
        const raca = a.raca.toLowerCase();

        return nome.includes(termo) || raca.includes(termo);
      }

      return true;
    });
  }, [animais, filtroStatus, filtroEspecie, busca]);

  return (
    <div className="space-y-6">
      {/* Barra de Ações Rápidas: Busca + Filtro de Espécie + Botão Novo Pet */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-neutral-200/80 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome do pet ou raça..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Filtro de Espécie */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500 shrink-0" />
          <select
            value={filtroEspecie}
            onChange={(e) => setFiltroEspecie(e.target.value)}
            className="text-xs px-3.5 py-2.5 rounded-2xl border border-neutral-200 bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="TODAS">Todas as Espécies</option>
            <option value={Especie.CACHORRO}>Apenas Cães</option>
            <option value={Especie.GATO}>Apenas Gatos</option>
            <option value={Especie.OUTRO}>Outros Animais</option>
          </select>
        </div>

        {/* Botão Cadastrar Novo Animal */}
        <Link
          href="/dashboard/animais/novo"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Pet</span>
        </Link>
      </div>

      {/* Abas por Status */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "TODOS", label: "Todos os Pets", count: contadores.TODOS },
          { id: StatusAnimal.DISPONIVEL, label: "Disponíveis", count: contadores.DISPONIVEL },
          { id: StatusAnimal.EM_PROCESSO, label: "Em Processo", count: contadores.EM_PROCESSO },
          { id: StatusAnimal.EM_TRATAMENTO, label: "Em Tratamento", count: contadores.EM_TRATAMENTO },
          { id: StatusAnimal.ADOTADO, label: "Finais Felizes ❤️", count: contadores.ADOTADO },
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

      {/* Listagem */}
      {animaisFiltrados.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-neutral-200/80 text-center space-y-3">
          <div className="w-14 h-14 bg-neutral-100 text-neutral-400 rounded-2xl mx-auto flex items-center justify-center">
            <PawPrint className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-neutral-800">
            Nenhum animal encontrado com estes filtros
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {busca || filtroStatus !== "TODOS" || filtroEspecie !== "TODAS"
              ? "Tente ajustar o termo de busca ou filtros para ver outros animais."
              : "Cadastre o primeiro pet no abrigo clicando no botão acima."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <span className="text-xs font-semibold text-neutral-500 px-1">
            Exibindo <strong>{animaisFiltrados.length}</strong> de {animais.length} animais cadastrados
          </span>
          <div className="grid grid-cols-1 gap-4">
            {animaisFiltrados.map((a) => (
              <AnimalCardAdmin key={a.id} animal={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

