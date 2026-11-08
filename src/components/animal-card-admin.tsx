"use client";

import { useState } from "react";
import { atualizarStatusAnimal, alternarDestaqueAnimal } from "@/actions/animal";
import { StatusAnimal, Especie, Porte, Sexo } from "@prisma/client";
import {
  Star,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export interface AnimalAdminData {
  id: string;
  nome: string;
  slug: string;
  especie: Especie;
  raca: string;
  porte: Porte;
  sexo: Sexo;
  idadeEstimadaMeses: number;
  pesoKg?: number | null;
  castrado: boolean;
  vacinado: boolean;
  vermifugado: boolean;
  necessidadesEspeciais: boolean;
  descricaoSaude?: string | null;
  temperamento: string[];
  exigeTelaProtecao: boolean;
  historia: string;
  status: StatusAnimal;
  destaqueVitrine: boolean;
  ativo: boolean;
  createdAt: Date | string;
  fotos: { url: string }[];
}

export function AnimalCardAdmin({ animal }: { animal: AnimalAdminData }) {
  const [status, setStatus] = useState<StatusAnimal>(animal.status);
  const [destaque, setDestaque] = useState(animal.destaqueVitrine);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingDestaque, setLoadingDestaque] = useState(false);
  const [msgSucesso, setMsgSucesso] = useState(false);

  const statusConfig: Record<StatusAnimal, { label: string; badge: string; border: string }> = {
    DISPONIVEL: {
      label: "Disponível para Adoção",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      border: "border-l-4 border-l-emerald-500",
    },
    EM_PROCESSO: {
      label: "Em Processo de Adoção",
      badge: "bg-purple-100 text-purple-800 border-purple-200",
      border: "border-l-4 border-l-purple-500",
    },
    EM_TRATAMENTO: {
      label: "Em Tratamento Veterinário",
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      border: "border-l-4 border-l-amber-500",
    },
    ADOTADO: {
      label: "Adotado (Final Feliz) ❤️",
      badge: "bg-blue-100 text-blue-800 border-blue-200",
      border: "border-l-4 border-l-blue-500",
    },
    INDISPONIVEL: {
      label: "Indisponível",
      badge: "bg-neutral-200 text-neutral-700 border-neutral-300",
      border: "border-l-4 border-l-neutral-400",
    },
    OBITO: {
      label: "Óbito (Histórico)",
      badge: "bg-neutral-900 text-white border-neutral-800",
      border: "border-l-4 border-l-neutral-900",
    },
  };

  async function handleMudarStatus(novoStatus: StatusAnimal) {
    setStatus(novoStatus);
    setLoadingStatus(true);
    setMsgSucesso(false);

    try {
      const res = await atualizarStatusAnimal({
        id: animal.id,
        status: novoStatus,
      });

      if (res.success) {
        setMsgSucesso(true);
        setTimeout(() => setMsgSucesso(false), 2500);
      } else {
        alert("Erro ao atualizar: " + res.error);
      }
    } catch {
      alert("Falha na comunicação com o servidor.");
    } finally {
      setLoadingStatus(false);
    }
  }

  async function handleAlternarDestaque() {
    const novoDestaque = !destaque;
    setDestaque(novoDestaque);
    setLoadingDestaque(true);

    try {
      const res = await alternarDestaqueAnimal({
        id: animal.id,
        destaque: novoDestaque,
      });

      if (!res.success) {
        setDestaque(!novoDestaque);
        alert("Erro ao alterar destaque: " + res.error);
      }
    } catch {
      setDestaque(!novoDestaque);
      alert("Falha na comunicação com o servidor.");
    } finally {
      setLoadingDestaque(false);
    }
  }

  // Idade formatada
  const anos = Math.floor(animal.idadeEstimadaMeses / 12);
  const meses = animal.idadeEstimadaMeses % 12;
  let idadeTexto = "";
  if (anos > 0 && meses > 0) {
    idadeTexto = `${anos} ano${anos > 1 ? "s" : ""} e ${meses} m`;
  } else if (anos > 0) {
    idadeTexto = `${anos} ano${anos > 1 ? "s" : ""}`;
  } else {
    idadeTexto = `${meses} mes${meses > 1 ? "es" : ""}`;
  }

  const fotoUrl =
    animal.fotos[0]?.url ||
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400";

  return (
    <div
      className={`bg-white rounded-3xl shadow-sm border border-neutral-200/80 p-5 space-y-4 hover:shadow-md transition duration-200 ${
        statusConfig[status]?.border || ""
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Bloco Foto + Infos do Pet */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fotoUrl} alt={animal.nome} className="w-full h-full object-cover" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-neutral-900 truncate">
                {animal.nome}
              </h3>
              <span className="text-xs text-neutral-400">
                ({animal.sexo === "MACHO" ? "Macho" : "Fêmea"})
              </span>
            </div>

            <p className="text-xs text-neutral-500 truncate">
              {animal.especie === "CACHORRO" ? "🐶 Cão" : animal.especie === "GATO" ? "🐱 Gato" : "🐾 Outro"} •{" "}
              {animal.raca} • {idadeTexto} • Porte {animal.porte}
            </p>

            {/* Badges de Saúde */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {animal.castrado && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Castrado ✓
                </span>
              )}
              {animal.vacinado && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  Vacinado ✓
                </span>
              )}
              {animal.exigeTelaProtecao && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  Exige Telas
                </span>
              )}
              {animal.necessidadesEspeciais && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                  Cuidados Especiais
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bloco Destaque na Home + Link Vitrine */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handleAlternarDestaque}
            disabled={loadingDestaque}
            title={destaque ? "Remover destaque da Home" : "Destacar na Home"}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
              destaque
                ? "bg-amber-50 text-amber-800 border-amber-300 shadow-2xs"
                : "bg-neutral-50 text-neutral-400 hover:text-neutral-700 border-neutral-200"
            }`}
          >
            {loadingDestaque ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Star className={`w-3.5 h-3.5 ${destaque ? "fill-amber-500 text-amber-500" : ""}`} />
            )}
            <span>{destaque ? "Destaque Ativo" : "Destacar"}</span>
          </button>

          <Link
            href={`/animais/${animal.slug}`}
            target="_blank"
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
            title="Ver página pública do animal"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Controles de Status do Pet */}
      <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <label className="font-bold text-neutral-700">Status Operacional:</label>
          <select
            value={status}
            disabled={loadingStatus}
            onChange={(e) => handleMudarStatus(e.target.value as StatusAnimal)}
            className="px-3.5 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value={StatusAnimal.DISPONIVEL}>Disponível para Adoção</option>
            <option value={StatusAnimal.EM_PROCESSO}>Em Processo (Entrevista)</option>
            <option value={StatusAnimal.EM_TRATAMENTO}>Em Tratamento Veterinário</option>
            <option value={StatusAnimal.ADOTADO}>Adotado (Final Feliz)</option>
            <option value={StatusAnimal.INDISPONIVEL}>Indisponível</option>
            <option value={StatusAnimal.OBITO}>Óbito (Histórico)</option>
          </select>

          {loadingStatus && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
          {msgSucesso && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Atualizado!
            </span>
          )}
        </div>

        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border self-start sm:self-auto ${
            statusConfig[status]?.badge
          }`}
        >
          {statusConfig[status]?.label}
        </span>
      </div>
    </div>
  );
}

