"use client";

import { useState } from "react";
import { criarVoluntarioInscricao } from "@/actions/voluntario";
import {
  IDEIAS_DISPONIBILIDADE,
  MODALIDADE_VOLUNTARIADO_CONFIG,
} from "@/lib/voluntario-labels";
import { MUNICIPIOS_SUGERIDOS } from "@/lib/utils";
import type { ModalidadeVoluntariado } from "@prisma/client";
import {
  CalendarClock,
  CheckCircle2,
  Copy,
  Footprints,
  HandHeart,
  Home,
  Loader2,
  MapPin,
  Sparkles,
  User,
} from "lucide-react";

interface FormVoluntarioProps {
  modalidade: ModalidadeVoluntariado;
  onChangeModalidade: (mod: ModalidadeVoluntariado) => void;
}

const MODALIDADE_ICONS: Record<ModalidadeVoluntariado, React.ReactNode> = {
  PASSEIOS: <Footprints className="w-4 h-4 text-emerald-700" />,
  LAR_TEMPORARIO: <Home className="w-4 h-4 text-amber-700" />,
  PERSONALIZADO: <Sparkles className="w-4 h-4 text-purple-700" />,
};

export function FormVoluntario({
  modalidade,
  onChangeModalidade,
}: FormVoluntarioProps) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [aceitouTermosLGPD, setAceitouTermosLGPD] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protocoloSucesso, setProtocoloSucesso] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!aceitouTermosLGPD) {
      setError("Você precisa aceitar o termo de contato e LGPD para enviar.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("modalidade", modalidade);
      formData.append("nome", nome);
      formData.append("whatsapp", whatsapp);
      formData.append("municipio", municipio);
      formData.append("disponibilidade", disponibilidade);
      formData.append("descricao", descricao);
      formData.append("aceitouTermosLGPD", String(aceitouTermosLGPD));

      const res = await criarVoluntarioInscricao(formData);
      if (!res.success) {
        setError(res.error || "Não foi possível enviar seu cadastro.");
        return;
      }

      setProtocoloSucesso(res.protocolo || "VOL-OK");
    } catch {
      setError("Ocorreu uma falha de conexão ao enviar seu cadastro.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopiarProtocolo() {
    if (!protocoloSucesso || typeof navigator === "undefined") return;
    navigator.clipboard?.writeText(protocoloSucesso);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  function resetarFormulario() {
    setProtocoloSucesso(null);
    setDisponibilidade("");
    setDescricao("");
    setError(null);
  }

  if (protocoloSucesso) {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-emerald-200 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
            Cadastro de Voluntário Recebido
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900">
            Que alegria contar com você!
          </h2>
          <p className="text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
            Recebemos seu cadastro para{" "}
            <strong>{MODALIDADE_VOLUNTARIADO_CONFIG[modalidade].label}</strong> (
            {municipio}). Nossa equipe entrará em contato pelo seu WhatsApp de acordo
            com sua disponibilidade!
          </p>
        </div>

        <div className="p-5 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 max-w-md mx-auto space-y-2">
          <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider block">
            Protocolo de Inscrição
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-mono font-black text-emerald-800 tracking-wider">
              {protocoloSucesso}
            </span>
            <button
              type="button"
              onClick={handleCopiarProtocolo}
              className="p-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition cursor-pointer"
              title="Copiar protocolo"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copiado && (
            <span className="text-[11px] font-bold text-emerald-700 block">
              Protocolo copiado!
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={resetarFormulario}
          className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm rounded-xl transition cursor-pointer"
        >
          Enviar Outro Cadastro de Voluntariado
        </button>
      </div>
    );
  }

  return (
    <form
      id="formulario-voluntario"
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-neutral-200/80 space-y-8"
    >
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold">
          {error}
        </div>
      )}

      {/* 1. MODALIDADE DE VOLUNTARIADO */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <HandHeart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              1. Como gostaria de ser voluntário(a)?
            </h3>
            <p className="text-xs text-neutral-500">
              Escolha entre passeios, lar temporário ou voluntariado personalizado
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(
            Object.keys(
              MODALIDADE_VOLUNTARIADO_CONFIG
            ) as ModalidadeVoluntariado[]
          ).map((mod) => {
            const info = MODALIDADE_VOLUNTARIADO_CONFIG[mod];
            const selecionado = modalidade === mod;
            return (
              <button
                key={mod}
                type="button"
                onClick={() => onChangeModalidade(mod)}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer space-y-1.5 ${
                  selecionado
                    ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20"
                    : "bg-white border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {MODALIDADE_ICONS[mod]}
                  <span className="text-sm font-extrabold text-neutral-900">
                    {info.label}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-snug">
                  {info.descricao}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DADOS DO VOLUNTÁRIO & DISPONIBILIDADE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              2. Seus Dados e Disponibilidade
            </h3>
            <p className="text-xs text-neutral-500">
              Informe telefone com WhatsApp, município e os horários em que pode ajudar
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Seu Nome Completo *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Ana Paula Costa"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Telefone / WhatsApp (com DDD) *
            </label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: (27) 99999-8888"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-neutral-500" />
              <span>Município *</span>
            </label>
            <input
              type="text"
              required
              list="municipios-voluntario"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              placeholder="Ex: Vitória, Vila Velha, Serra..."
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <datalist id="municipios-voluntario">
              {MUNICIPIOS_SUGERIDOS.map((cidade) => (
                <option key={cidade} value={cidade} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800 flex items-center gap-1">
              <CalendarClock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Sua Disponibilidade *</span>
            </label>
            <input
              type="text"
              required
              value={disponibilidade}
              onChange={(e) => setDisponibilidade(e.target.value)}
              placeholder="Ex: Sábados pela manhã, quartas à tarde..."
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
            Sugestões de disponibilidade (toque para preencher):
          </span>
          <div className="flex flex-wrap gap-2">
            {IDEIAS_DISPONIBILIDADE.map((sugestao) => (
              <button
                key={sugestao}
                type="button"
                onClick={() => setDisponibilidade(sugestao)}
                className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-emerald-100 text-neutral-800 hover:text-emerald-900 text-xs font-semibold border border-neutral-200 hover:border-emerald-300 transition cursor-pointer"
              >
                + {sugestao}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-bold text-neutral-800">
            Conte mais sobre como pode ajudar *
          </label>
          <textarea
            rows={4}
            required
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder={
              MODALIDADE_VOLUNTARIADO_CONFIG[modalidade].placeholderDescricao
            }
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* LGPD E ENVIO */}
      <div className="pt-4 border-t border-neutral-100 space-y-5">
        <label className="flex items-start gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 cursor-pointer">
          <input
            type="checkbox"
            checked={aceitouTermosLGPD}
            onChange={(e) => setAceitouTermosLGPD(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-neutral-300 shrink-0"
          />
          <span className="text-xs text-neutral-700 leading-relaxed">
            Autorizo a equipe da Esperança Animal a entrar em contato comigo pelo
            telefone/WhatsApp informado exclusivamente para organizar atividades
            voluntárias (LGPD).
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm transition cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Enviando Cadastro...</span>
            </>
          ) : (
            <>
              <HandHeart className="w-5 h-5" />
              <span>Quero Ser Voluntário(a)</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

