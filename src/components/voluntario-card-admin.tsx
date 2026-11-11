"use client";

import { useState } from "react";
import { atualizarStatusVoluntario } from "@/actions/voluntario";
import {
  MODALIDADE_VOLUNTARIADO_CONFIG,
  STATUS_VOLUNTARIO_CONFIG,
  gerarLinkWhatsappVoluntario,
} from "@/lib/voluntario-labels";
import { formatarWhatsappVisual } from "@/lib/utils";
import type { ModalidadeVoluntariado, StatusVoluntario } from "@prisma/client";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  User,
} from "lucide-react";

export interface VoluntarioAdminDTO {
  id: string;
  protocolo: string;
  nome: string;
  whatsapp: string;
  municipio: string;
  disponibilidade: string;
  modalidade: ModalidadeVoluntariado;
  descricao: string;
  status: StatusVoluntario;
  observacaoEquipe: string | null;
  createdAt: string;
}

export function VoluntarioCardAdmin({ item }: { item: VoluntarioAdminDTO }) {
  const [statusAtual, setStatusAtual] = useState<StatusVoluntario>(item.status);
  const [statusSelecionado, setStatusSelecionado] = useState<StatusVoluntario>(
    item.status
  );
  const [observacaoEquipe, setObservacaoEquipe] = useState(
    item.observacaoEquipe || ""
  );
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [ultimoWppUrl, setUltimoWppUrl] = useState<string | null>(null);

  async function handleSalvar(abrirWhatsapp: boolean) {
    setLoading(true);
    setErro(null);
    setFeedback(null);

    try {
      const res = await atualizarStatusVoluntario({
        id: item.id,
        status: statusSelecionado,
        observacaoEquipe,
      });

      if (!res.success) {
        setErro(res.error || "Não foi possível atualizar este voluntário.");
        return;
      }

      setStatusAtual(statusSelecionado);
      const wppUrl =
        res.whatsappUrl ||
        gerarLinkWhatsappVoluntario(item.whatsapp, {
          nome: item.nome,
          protocolo: item.protocolo,
          modalidade: item.modalidade,
          municipio: item.municipio,
          disponibilidade: item.disponibilidade,
          observacaoEquipe,
        });

      setUltimoWppUrl(wppUrl);

      if (abrirWhatsapp && wppUrl && typeof window !== "undefined") {
        window.open(wppUrl, "_blank", "noopener,noreferrer");
        setFeedback("Status salvo e WhatsApp aberto para contato com o voluntário!");
      } else {
        setFeedback("Status salvo com sucesso.");
      }
    } catch {
      setErro("Falha de conexão ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  const modalidadeConfig = MODALIDADE_VOLUNTARIADO_CONFIG[item.modalidade];
  const statusConfig = STATUS_VOLUNTARIO_CONFIG[statusAtual];

  return (
    <div
      className={`bg-white rounded-3xl shadow-sm border border-neutral-200/80 p-5 sm:p-6 space-y-4 ${statusConfig.border}`}
    >
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900 bg-neutral-100 px-3 py-1 rounded-xl">
            {item.protocolo}
          </span>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-xl border ${modalidadeConfig.badge}`}
          >
            {modalidadeConfig.label}
          </span>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-xl border ${statusConfig.badge}`}
          >
            {statusConfig.label}
          </span>
        </div>

        <div className="text-xs text-neutral-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {new Date(item.createdAt).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Dados do Voluntário + Descrição */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>Voluntário(a)</span>
          </span>

          <h3 className="text-base font-black text-neutral-900">{item.nome}</h3>

          <p className="text-xs text-neutral-700 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{formatarWhatsappVisual(item.whatsapp)}</span>
          </p>

          <p className="text-xs text-neutral-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <strong>{item.municipio}</strong>
          </p>

          <p className="text-xs text-neutral-800 flex items-start gap-1.5 pt-1">
            <CalendarClock className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Disponibilidade:</strong> {item.disponibilidade}
            </span>
          </p>
        </div>

        <div className="lg:col-span-7 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
            Como consegue ajudar
          </span>
          <p className="text-sm text-neutral-900 whitespace-pre-line leading-relaxed">
            {item.descricao}
          </p>
        </div>
      </div>

      {/* Painel de Atendimento */}
      <div className="pt-4 border-t border-neutral-100 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-neutral-800">
              Status do Voluntário
            </label>
            <select
              value={statusSelecionado}
              onChange={(e) =>
                setStatusSelecionado(e.target.value as StatusVoluntario)
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {(
                Object.keys(STATUS_VOLUNTARIO_CONFIG) as StatusVoluntario[]
              ).map((st) => (
                <option key={st} value={st}>
                  {STATUS_VOLUNTARIO_CONFIG[st].label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-neutral-800">
              Anotação / Mensagem ao Voluntário (opcional)
            </label>
            <input
              type="text"
              value={observacaoEquipe}
              onChange={(e) => setObservacaoEquipe(e.target.value)}
              placeholder="Ex: Combinado passeio no sábado às 9h / envio de orientações de LT..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {erro && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
            {erro}
          </div>
        )}

        {feedback && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {feedback}
            </span>
            {ultimoWppUrl && (
              <a
                href={ultimoWppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-extrabold text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                <span>Abrir WhatsApp novamente</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSalvar(false)}
            className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Somente Salvar</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSalvar(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
            <span>Salvar e Chamar no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}

