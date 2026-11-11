"use client";

import { useState } from "react";
import { atualizarStatusCastracao } from "@/actions/castracao";
import {
  ESPECIE_PET_LABEL,
  SERVICO_CONFIG,
  SEXO_PET_LABEL,
  STATUS_SERVICO_CONFIG,
  formatarWhatsappVisual,
  gerarLinkWhatsappCastracao,
} from "@/lib/castracao-labels";
import type {
  Especie,
  Sexo,
  StatusSolicitacaoServico,
  TipoServicoPet,
} from "@prisma/client";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  MessageCircle,
  PawPrint,
  Phone,
  Save,
  Scale,
  User,
} from "lucide-react";

export interface CastracaoAdminDTO {
  id: string;
  protocolo: string;
  nomeTutor: string;
  whatsapp: string;
  endereco: string;
  bairro: string;
  municipio: string;
  nomePet: string;
  especie: Especie;
  sexo: Sexo;
  pesoKg: number;
  idadeEstimada: string | null;
  tipoServico: TipoServicoPet;
  observacoesSaude: string | null;
  status: StatusSolicitacaoServico;
  avisoStatus: string | null;
  dataAgendamento: string | null;
  localAtendimento: string | null;
  createdAt: string;
  updatedAt: string;
  avaliadoPorNome: string | null;
}

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(
    dt.getHours()
  )}:${pad(dt.getMinutes())}`;
}

export function CastracaoCardAdmin({ item }: { item: CastracaoAdminDTO }) {
  const [statusAtual, setStatusAtual] = useState<StatusSolicitacaoServico>(
    item.status
  );
  const [statusSelecionado, setStatusSelecionado] =
    useState<StatusSolicitacaoServico>(item.status);
  const [avisoStatus, setAvisoStatus] = useState(
    item.avisoStatus || STATUS_SERVICO_CONFIG[item.status].avisoPadrao
  );
  const [dataAgendamento, setDataAgendamento] = useState(
    toDatetimeLocalValue(item.dataAgendamento)
  );
  const [localAtendimento, setLocalAtendimento] = useState(
    item.localAtendimento || ""
  );

  const [loading, setLoading] = useState(false);
  const [feedbackSucesso, setFeedbackSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimoWhatsappUrl, setUltimoWhatsappUrl] = useState<string | null>(
    null
  );

  function handleTrocarStatusSelect(novo: StatusSolicitacaoServico) {
    const avisoAtualEhPadrao = Object.values(STATUS_SERVICO_CONFIG).some(
      (cfg) => cfg.avisoPadrao === avisoStatus.trim()
    );
    if (!avisoStatus.trim() || avisoAtualEhPadrao) {
      setAvisoStatus(STATUS_SERVICO_CONFIG[novo].avisoPadrao);
    }
    setStatusSelecionado(novo);
  }

  async function handleSalvar(enviarWhatsapp: boolean) {
    setLoading(true);
    setErro(null);
    setFeedbackSucesso(null);

    try {
      const res = await atualizarStatusCastracao({
        id: item.id,
        status: statusSelecionado,
        avisoStatus,
        dataAgendamento: dataAgendamento || null,
        localAtendimento: localAtendimento || null,
      });

      if (!res.success) {
        setErro(res.error || "Não foi possível atualizar o protocolo.");
        return;
      }

      setStatusAtual(statusSelecionado);
      if (res.avisoAplicado) {
        setAvisoStatus(res.avisoAplicado);
      }

      const wppUrl =
        res.whatsappUrl ||
        gerarLinkWhatsappCastracao(item.whatsapp, {
          nomeTutor: item.nomeTutor,
          nomePet: item.nomePet,
          protocolo: item.protocolo,
          municipio: item.municipio,
          tipoServico: item.tipoServico,
          status: statusSelecionado,
          avisoStatus,
          dataAgendamento: dataAgendamento || null,
          localAtendimento: localAtendimento || null,
        });

      setUltimoWhatsappUrl(wppUrl);

      if (enviarWhatsapp && wppUrl && typeof window !== "undefined") {
        window.open(wppUrl, "_blank", "noopener,noreferrer");
        setFeedbackSucesso(
          "Status salvo e WhatsApp aberto com a mensagem pronta para envio!"
        );
      } else {
        setFeedbackSucesso("Status atualizado no sistema.");
      }
    } catch {
      setErro("Falha de conexão ao salvar atualização.");
    } finally {
      setLoading(false);
    }
  }

  const statusConfigAtual = STATUS_SERVICO_CONFIG[statusAtual];
  const servicoConfig = SERVICO_CONFIG[item.tipoServico];

  return (
    <div
      className={`bg-white rounded-3xl shadow-sm border border-neutral-200/80 p-5 sm:p-6 space-y-5 ${statusConfigAtual.border}`}
    >
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900 bg-neutral-100 px-3 py-1 rounded-xl">
            {item.protocolo}
          </span>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-xl border ${servicoConfig.badge}`}
          >
            {servicoConfig.label}
          </span>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-xl border ${statusConfigAtual.badge}`}
          >
            {statusConfigAtual.label}
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

      {/* Informações do Pet e Tutor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bloco Pet */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <PawPrint className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dados do Animal</span>
            </span>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Scale className="w-3 h-3" />
              {item.pesoKg} kg
            </span>
          </div>

          <div>
            <h3 className="text-lg font-black text-neutral-900">{item.nomePet}</h3>
            <p className="text-xs text-neutral-600">
              {ESPECIE_PET_LABEL[item.especie]} • {SEXO_PET_LABEL[item.sexo]}
              {item.idadeEstimada ? ` • ${item.idadeEstimada}` : ""}
            </p>
          </div>

          {item.observacoesSaude && (
            <p className="text-xs text-neutral-700 bg-white p-2.5 rounded-xl border border-neutral-200 leading-relaxed">
              <strong>Obs. Saúde:</strong> {item.observacoesSaude}
            </p>
          )}
        </div>

        {/* Bloco Tutor & Município */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Tutor &amp; Município</span>
            </span>
            <span className="text-xs font-extrabold text-amber-900 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {item.municipio}
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-neutral-900">
              {item.nomeTutor}
            </h4>
            <p className="text-xs text-neutral-600 flex items-center gap-1.5 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{formatarWhatsappVisual(item.whatsapp)}</span>
            </p>
          </div>

          <p className="text-xs text-neutral-700 leading-relaxed">
            <strong>Endereço:</strong> {item.endereco} — {item.bairro},{" "}
            <strong>{item.municipio}</strong>
          </p>
        </div>
      </div>

      {/* Painel de Atualização de Status + Aviso WhatsApp */}
      <div className="pt-4 border-t border-neutral-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Andamento do Protocolo
            </label>
            <select
              value={statusSelecionado}
              onChange={(e) =>
                handleTrocarStatusSelect(
                  e.target.value as StatusSolicitacaoServico
                )
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {(
                Object.keys(STATUS_SERVICO_CONFIG) as StatusSolicitacaoServico[]
              ).map((st) => (
                <option key={st} value={st}>
                  {STATUS_SERVICO_CONFIG[st].label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>Data/Hora Agendada (opcional)</span>
            </label>
            <input
              type="datetime-local"
              value={dataAgendamento}
              onChange={(e) => setDataAgendamento(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Local / Clínica do Atendimento (opcional)
            </label>
            <input
              type="text"
              value={localAtendimento}
              onChange={(e) => setLocalAtendimento(e.target.value)}
              placeholder="Ex: Clínica Amigo Pet - Centro"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-800">
            Aviso de Status (aparece na consulta do protocolo e vai no WhatsApp)
          </label>
          <textarea
            rows={2}
            value={avisoStatus}
            onChange={(e) => setAvisoStatus(e.target.value)}
            placeholder="Escreva orientações ao tutor (ex: jejum de 8h antes da cirurgia)..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {erro && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
            {erro}
          </div>
        )}

        {feedbackSucesso && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {feedbackSucesso}
            </span>
            {ultimoWhatsappUrl && (
              <a
                href={ultimoWhatsappUrl}
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
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
            <span>Somente Salvar Status</span>
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
            <span>Atualizar Status e Enviar WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}

