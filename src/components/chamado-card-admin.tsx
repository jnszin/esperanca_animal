"use client";

import { useState } from "react";
import Link from "next/link";
import { atualizarStatusChamado } from "@/actions/chamado";
import { StatusAcolhimento, NivelUrgencia, Especie } from "@prisma/client";
import {
  MapPin,
  Phone,
  Heart,
  Clock,
  UserCheck,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Loader2,
  PawPrint,
} from "lucide-react";

interface ChamadoData {
  id: string;
  protocolo: string;
  nomeSolicitante: string;
  whatsapp: string;
  podeDarLarTemporario: boolean;
  especie: Especie;
  nivelUrgencia: NivelUrgencia;
  descricaoSituacao: string;
  enderecoOcorrencia: string;
  pontoReferencia?: string | null;
  bairro: string;
  cidade: string;
  latitude?: number | null;
  longitude?: number | null;
  fotosOcorrenciaUrls: string[];
  status: StatusAcolhimento;
  parecerONG?: string | null;
  createdAt: Date | string;
  atendidoPor?: { nome: string; email: string } | null;
}

export function ChamadoCardAdmin({ chamado }: { chamado: ChamadoData }) {
  const [status, setStatus] = useState<StatusAcolhimento>(chamado.status);
  const [parecer, setParecer] = useState(chamado.parecerONG || "");
  const [loading, setLoading] = useState(false);
  const [mostrarParecer, setMostrarParecer] = useState(false);
  const [msgSucesso, setMsgSucesso] = useState(false);

  const urgenciaConfig: Record<
    NivelUrgencia,
    { label: string; badge: string; border: string }
  > = {
    CRITICA: {
      label: "Crítica",
      badge: "bg-red-100 text-red-800 border-red-200",
      border: "border-l-4 border-l-red-600",
    },
    ALTA: {
      label: "Alta",
      badge: "bg-orange-100 text-orange-800 border-orange-200",
      border: "border-l-4 border-l-orange-500",
    },
    MEDIA: {
      label: "Média",
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      border: "border-l-4 border-l-amber-500",
    },
    BAIXA: {
      label: "Baixa",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      border: "border-l-4 border-l-emerald-500",
    },
  };

  const statusConfig: Record<StatusAcolhimento, { label: string; badge: string }> = {
    PENDENTE_ANALISE: {
      label: "Pendente de Análise",
      badge: "bg-neutral-100 text-neutral-700 border-neutral-300",
    },
    EM_DESLOCAMENTO: {
      label: "Em Deslocamento",
      badge: "bg-blue-100 text-blue-800 border-blue-200",
    },
    RESGATADO: {
      label: "Animal Resgatado",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    ENCAMINHADO_TERCEIROS: {
      label: "Encaminhado a Parceiros",
      badge: "bg-purple-100 text-purple-800 border-purple-200",
    },
    FINALIZADO_SEM_RESGATE: {
      label: "Finalizado s/ Resgate",
      badge: "bg-neutral-200 text-neutral-600 border-neutral-300",
    },
  };

  async function handleSalvarStatus(novoStatus: StatusAcolhimento) {
    setStatus(novoStatus);
    setLoading(true);
    setMsgSucesso(false);

    try {
      const res = await atualizarStatusChamado({
        chamadoId: chamado.id,
        status: novoStatus,
        parecerONG: parecer,
      });

      if (res.success) {
        setMsgSucesso(true);
        setTimeout(() => setMsgSucesso(false), 3000);
      } else {
        alert("Erro ao atualizar status: " + res.error);
      }
    } catch {
      alert("Falha na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  const mapsUrl =
    chamado.latitude && chamado.longitude
      ? `https://www.google.com/maps?q=${chamado.latitude},${chamado.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${chamado.enderecoOcorrencia}, ${chamado.bairro}, ${chamado.cidade}`
        )}`;

  const dataFormatada = new Date(chamado.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-neutral-200/80 p-5 sm:p-6 space-y-4 ${
        urgenciaConfig[chamado.nivelUrgencia]?.border || ""
      }`}
    >
      {/* Topo do Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold text-sm text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-lg">
            {chamado.protocolo}
          </span>

          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              urgenciaConfig[chamado.nivelUrgencia]?.badge
            }`}
          >
            Urgência {urgenciaConfig[chamado.nivelUrgencia]?.label}
          </span>

          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              statusConfig[status]?.badge
            }`}
          >
            {statusConfig[status]?.label}
          </span>

          {chamado.podeDarLarTemporario && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Heart className="w-3 h-3 fill-emerald-600 text-emerald-600" />
              Oferece Lar Temporário
            </span>
          )}
        </div>

        <div className="text-xs text-neutral-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{dataFormatada}</span>
        </div>
      </div>

      {/* Descrição e Dados */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wide">
          <span>
            {chamado.especie === "CACHORRO"
              ? "🐶 Cão"
              : chamado.especie === "GATO"
              ? "🐱 Gato"
              : "🐾 Outro"}
          </span>
          <span>•</span>
          <span>Relato da Ocorrência:</span>
        </div>
        <p className="text-sm text-neutral-700 leading-relaxed bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
          {chamado.descricaoSituacao}
        </p>
      </div>

      {/* Galeria de Fotos */}
      {chamado.fotosOcorrenciaUrls && chamado.fotosOcorrenciaUrls.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-neutral-600">
            Fotos anexadas pelo solicitante:
          </span>
          <div className="flex flex-wrap gap-2.5">
            {chamado.fotosOcorrenciaUrls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 hover:opacity-90 transition group shadow-2xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Localização e Solicitante */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-neutral-100 text-xs">
        <div className="space-y-1">
          <span className="font-bold text-neutral-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Localização da Ocorrência:</span>
          </span>
          <p className="text-neutral-600">
            {chamado.enderecoOcorrencia} - {chamado.bairro}, {chamado.cidade}
            {chamado.pontoReferencia && ` (${chamado.pontoReferencia})`}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold pt-0.5 transition"
          >
            <span>Ver no Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="space-y-1">
          <span className="font-bold text-neutral-700 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Solicitante:</span>
          </span>
          <p className="text-neutral-800 font-medium">{chamado.nomeSolicitante}</p>
          <a
            href={`https://wa.me/${chamado.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition w-fit"
          >
            <Phone className="w-3 h-3 text-emerald-600" />
            <span>Conversar no WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Controles de Ação do Voluntário */}
      <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-bold text-neutral-700">Atualizar Status:</label>
          <select
            value={status}
            disabled={loading}
            onChange={(e) => handleSalvarStatus(e.target.value as StatusAcolhimento)}
            className="text-xs px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value={StatusAcolhimento.PENDENTE_ANALISE}>Pendente de Análise</option>
            <option value={StatusAcolhimento.EM_DESLOCAMENTO}>Em Deslocamento</option>
            <option value={StatusAcolhimento.RESGATADO}>Resgatado</option>
            <option value={StatusAcolhimento.ENCAMINHADO_TERCEIROS}>
              Encaminhado a Terceiros
            </option>
            <option value={StatusAcolhimento.FINALIZADO_SEM_RESGATE}>
              Finalizado sem Resgate
            </option>
          </select>

          {loading && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
          {msgSucesso && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Salvo!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href={`/dashboard/animais/novo?chamadoId=${chamado.id}&especie=${chamado.especie}`}
            className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 inline-flex items-center gap-1.5 transition"
          >
            <PawPrint className="w-3.5 h-3.5" />
            <span>Cadastrar como Pet</span>
          </Link>

          <button
            type="button"
            onClick={() => setMostrarParecer(!mostrarParecer)}
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
          >
            <span>{mostrarParecer ? "Ocultar Parecer" : "Adicionar Parecer"}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                mostrarParecer ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Campo de Parecer da ONG */}
      {mostrarParecer && (
        <div className="pt-2 space-y-2">
          <textarea
            rows={2}
            value={parecer}
            onChange={(e) => setParecer(e.target.value)}
            placeholder="Anotações internas da equipe sobre o resgate, estado clínico inicial ou destino do animal..."
            className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSalvarStatus(status)}
            className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition"
          >
            Salvar Parecer
          </button>
        </div>
      )}

      {chamado.atendidoPor && (
        <div className="text-[11px] text-neutral-400">
          Último atendimento registrado por: {chamado.atendidoPor.nome}
        </div>
      )}
    </div>
  );
}
