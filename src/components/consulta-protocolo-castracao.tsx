"use client";

import { useState, useEffect } from "react";
import {
  consultarProtocoloCastracao,
  type ProtocoloPublicoDTO,
} from "@/actions/castracao";
import {
  ESPECIE_PET_LABEL,
  PIPELINE_ETAPAS,
  SERVICO_CONFIG,
  SEXO_PET_LABEL,
  STATUS_SERVICO_CONFIG,
} from "@/lib/castracao-labels";
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  Bell,
  PawPrint,
  XCircle,
} from "lucide-react";

interface ConsultaProtocoloCastracaoProps {
  initialCode?: string;
  initialData?: ProtocoloPublicoDTO | null;
  initialError?: string | null;
}

export function ConsultaProtocoloCastracao({
  initialCode = "",
  initialData = null,
  initialError = null,
}: ConsultaProtocoloCastracaoProps) {
  const [codigo, setCodigo] = useState(initialCode);
  const [resultado, setResultado] = useState<ProtocoloPublicoDTO | null>(
    initialData
  );
  const [erro, setErro] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCodigo(initialCode);
    }
    if (initialData) {
      setResultado(initialData);
      setErro(null);
    }
  }, [initialCode, initialData]);

  async function executarBusca(codigoAlvo: string) {
    setLoading(true);
    setErro(null);
    try {
      const res = await consultarProtocoloCastracao(codigoAlvo);
      if (res.success && res.dados) {
        setResultado(res.dados);
      } else {
        setResultado(null);
        setErro(res.error || "Protocolo não encontrado.");
      }
    } catch {
      setErro("Não foi possível consultar o protocolo no momento.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await executarBusca(codigo);
  }

  const statusInfo = resultado
    ? STATUS_SERVICO_CONFIG[resultado.status]
    : null;
  const servicoInfo = resultado
    ? SERVICO_CONFIG[resultado.tipoServico]
    : null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-200/80 space-y-6">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
          <Bell className="w-3.5 h-3.5" />
          <span>Andamento de Protocolo &amp; Aviso de Status</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900">
          Consultar Solicitação de Castração / Vacina
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600">
          Digite o código de protocolo recebido no cadastro (ex: <strong className="font-mono text-neutral-800">CAS-2026-4812</strong>) para acompanhar a fila e ver os avisos da equipe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="Ex: CAS-2026-4812"
          required
          className="flex-1 px-4 py-3.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition shrink-0 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span>Consultar Protocolo</span>
        </button>
      </form>

      {erro && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span>{erro}</span>
        </div>
      )}

      {resultado && statusInfo && servicoInfo && (
        <div className="pt-4 border-t border-neutral-100 space-y-6">
          {/* Cabeçalho do Resultado */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
            <div className="flex items-center gap-3.5">
              {resultado.fotoPetUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resultado.fotoPetUrl}
                  alt={resultado.nomePet}
                  className="w-14 h-14 rounded-2xl object-cover border border-neutral-200 shrink-0"
                />
              ) : null}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-neutral-900">
                    {resultado.protocolo}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${servicoInfo.badge}`}
                  >
                    {servicoInfo.label}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 pt-1">
                  Pet <strong className="text-neutral-900">{resultado.nomePet}</strong> (
                  {ESPECIE_PET_LABEL[resultado.especie]} • {SEXO_PET_LABEL[resultado.sexo]} •{" "}
                  {resultado.pesoKg} kg) • Tutor(a): <strong>{resultado.primeiroNomeTutor}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-center">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{resultado.municipio}</span>
            </div>
          </div>

          {/* Aviso de Status Destacado */}
          <div
            className={`p-5 rounded-2xl border space-y-2 ${
              resultado.status === "CANCELADO"
                ? "bg-red-50 border-red-200 text-red-950"
                : resultado.status === "REALIZADO"
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : "bg-amber-50/80 border-amber-200 text-amber-950"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                Aviso de Status Atual
              </span>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full border ${statusInfo.badge}`}
              >
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              {resultado.avisoStatus || statusInfo.avisoPadrao}
            </p>

            {(resultado.dataAgendamento || resultado.localAtendimento) && (
              <div className="pt-2 mt-2 border-t border-black/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {resultado.dataAgendamento && (
                  <div className="flex items-center gap-2 font-bold">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>
                      Data/Hora:{" "}
                      {new Date(resultado.dataAgendamento).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                {resultado.localAtendimento && (
                  <div className="flex items-center gap-2 font-bold">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>Local: {resultado.localAtendimento}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Linha do Tempo de Andamento */}
          {resultado.status !== "CANCELADO" ? (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <PawPrint className="w-3.5 h-3.5 text-emerald-600" />
                <span>Etapas do Protocolo</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {PIPELINE_ETAPAS.map((etapa, idx) => {
                  const etapaInfo = STATUS_SERVICO_CONFIG[etapa];
                  const concluida = statusInfo.ordem > etapaInfo.ordem;
                  const atual = resultado.status === etapa;

                  return (
                    <div
                      key={etapa}
                      className={`p-3 rounded-xl border text-xs transition ${
                        atual
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                          : concluida
                          ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                          : "bg-neutral-50 text-neutral-400 border-neutral-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-[11px]">
                          0{idx + 1}
                        </span>
                        {(concluida || atual) && (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        )}
                      </div>
                      <p className="font-bold leading-snug">{etapaInfo.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Este protocolo foi encerrado / cancelado pela equipe.</span>
            </div>
          )}

          {/* Datas */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 pt-2 border-t border-neutral-100">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Cadastrado em{" "}
              {new Date(resultado.createdAt).toLocaleDateString("pt-BR")}
            </span>
            <span>
              Última atualização:{" "}
              {new Date(resultado.updatedAt).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

