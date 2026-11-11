"use client";

import { useState } from "react";
import { criarOfertaAjuda } from "@/actions/ajuda";
import {
  FORMA_ENTREGA_CONFIG,
  IDEIAS_MENSAGENS_AJUDA,
  TIPO_AJUDA_CONFIG,
} from "@/lib/ajuda-labels";
import { MUNICIPIOS_SUGERIDOS } from "@/lib/utils";
import type { FormaEntregaAjuda, TipoAjudaONG } from "@prisma/client";
import {
  CheckCircle2,
  Copy,
  HeartHandshake,
  Loader2,
  MapPin,
  MessageSquareHeart,
  Sparkles,
  User,
} from "lucide-react";

interface FormAjudaProps {
  tipoAjuda: TipoAjudaONG;
  onChangeTipoAjuda: (tipo: TipoAjudaONG) => void;
  mensagem: string;
  onChangeMensagem: (msg: string) => void;
}

export function FormAjuda({
  tipoAjuda,
  onChangeTipoAjuda,
  mensagem,
  onChangeMensagem,
}: FormAjudaProps) {
  const [nomeDoador, setNomeDoador] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [bairro, setBairro] = useState("");
  const [formaEntrega, setFormaEntrega] =
    useState<FormaEntregaAjuda>("A_COMBINAR");
  const [aceitouTermosLGPD, setAceitouTermosLGPD] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protocoloSucesso, setProtocoloSucesso] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  function aplicarIdeia(tipo: TipoAjudaONG, texto: string) {
    onChangeTipoAjuda(tipo);
    onChangeMensagem(texto);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!aceitouTermosLGPD) {
      setError("Você precisa aceitar o termo de contato e LGPD.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tipoAjuda", tipoAjuda);
      formData.append("formaEntrega", formaEntrega);
      formData.append("nomeDoador", nomeDoador);
      formData.append("whatsapp", whatsapp);
      formData.append("municipio", municipio);
      if (bairro.trim()) formData.append("bairro", bairro);
      formData.append("mensagem", mensagem);
      formData.append("aceitouTermosLGPD", String(aceitouTermosLGPD));

      const res = await criarOfertaAjuda(formData);
      if (!res.success) {
        setError(res.error || "Não foi possível registrar sua oferta de ajuda.");
        return;
      }

      setProtocoloSucesso(res.protocolo || "AJU-OK");
    } catch {
      setError("Ocorreu uma falha de conexão ao enviar sua mensagem.");
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
    onChangeMensagem("");
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
            Oferta de Ajuda Registrada
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900">
            Muito obrigado! A equipe já recebeu a sua ajuda.
          </h2>
          <p className="text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
            Registramos sua oferta na categoria{" "}
            <strong>{TIPO_AJUDA_CONFIG[tipoAjuda].label}</strong> ({municipio}). Em
            breve entraremos em contato pelo seu WhatsApp para combinar os detalhes!
          </p>
        </div>

        <div className="p-5 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 max-w-md mx-auto space-y-2">
          <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider block">
            Protocolo de Registro
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
          Enviar Outra Oferta de Ajuda
        </button>
      </div>
    );
  }

  return (
    <form
      id="formulario-ajuda"
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-neutral-200/80 space-y-8"
    >
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold">
          {error}
        </div>
      )}

      {/* 1. CATEGORIA DA AJUDA */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              1. Como você consegue ajudar hoje?
            </h3>
            <p className="text-xs text-neutral-500">
              Escolha uma categoria ou clique nas ideias prontas logo abaixo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(TIPO_AJUDA_CONFIG) as TipoAjudaONG[]).map((tipo) => {
            const info = TIPO_AJUDA_CONFIG[tipo];
            const selecionado = tipoAjuda === tipo;
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => onChangeTipoAjuda(tipo)}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  selecionado
                    ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20"
                    : "bg-white border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <span className="block text-sm font-extrabold text-neutral-900">
                  {info.label}
                </span>
                <span className="block text-[11px] text-neutral-600 mt-1 leading-snug">
                  {info.descricao}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MENSAGEM PERSONALIZADA & IDEIAS PRONTAS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <MessageSquareHeart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              2. Mensagem Personalizada para a Equipe
            </h3>
            <p className="text-xs text-neutral-500">
              Conte o que você tem disponível ou toque em uma ideia para preencher
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Ideias prontas (clique para preencher e editar):</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {IDEIAS_MENSAGENS_AJUDA.map((ideia) => (
              <button
                key={ideia.titulo}
                type="button"
                onClick={() => aplicarIdeia(ideia.tipo, ideia.texto)}
                className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-emerald-100 text-neutral-800 hover:text-emerald-900 text-xs font-semibold border border-neutral-200 hover:border-emerald-300 transition cursor-pointer"
              >
                + {ideia.titulo}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-800">
            Descreva sua oferta ou dúvida *
          </label>
          <textarea
            rows={4}
            required
            value={mensagem}
            onChange={(e) => onChangeMensagem(e.target.value)}
            placeholder='Ex: "Olá equipe, eu consigo ajudar com ração animal pois tenho sobrando aqui" ou "Olá equipe, consigo ajudar com shampoos de lavagem para cães e gatos"'
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 3. DADOS DE CONTATO E LOCALIDADE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              3. Seus Dados para Combinarmos
            </h3>
            <p className="text-xs text-neutral-500">
              A administradora entra em contato direto pelo WhatsApp para agradecer e
              combinar a entrega
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Seu Nome *
            </label>
            <input
              type="text"
              required
              value={nomeDoador}
              onChange={(e) => setNomeDoador(e.target.value)}
              placeholder="Ex: João Pereira"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              WhatsApp (com DDD) *
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
              list="municipios-ajuda"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              placeholder="Ex: Vitória, Vila Velha, Serra..."
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <datalist id="municipios-ajuda">
              {MUNICIPIOS_SUGERIDOS.map((cidade) => (
                <option key={cidade} value={cidade} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Bairro (Opcional)
            </label>
            <input
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Ex: Centro"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Como prefere entregar ou combinar?
            </label>
            <select
              value={formaEntrega}
              onChange={(e) =>
                setFormaEntrega(e.target.value as FormaEntregaAjuda)
              }
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {(Object.keys(FORMA_ENTREGA_CONFIG) as FormaEntregaAjuda[]).map(
                (forma) => (
                  <option key={forma} value={forma}>
                    {FORMA_ENTREGA_CONFIG[forma]}
                  </option>
                )
              )}
            </select>
          </div>
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
            Autorizo a equipe do Projeto Esperança Animal a entrar em contato comigo via
            WhatsApp exclusivamente para combinar esta doação/ajuda (LGPD).
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
              <span>Enviando Oferta...</span>
            </>
          ) : (
            <>
              <HeartHandshake className="w-5 h-5" />
              <span>Enviar Minha Oferta de Ajuda</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

