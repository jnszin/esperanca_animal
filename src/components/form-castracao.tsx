"use client";

import { useState } from "react";
import { criarSolicitacaoCastracao } from "@/actions/castracao";
import {
  MUNICIPIOS_SUGERIDOS,
  SERVICO_CONFIG,
} from "@/lib/castracao-labels";
import { Especie, Sexo, TipoServicoPet } from "@prisma/client";
import {
  CheckCircle2,
  Copy,
  Loader2,
  MapPin,
  PawPrint,
  Search,
  ShieldCheck,
  Syringe,
  User,
} from "lucide-react";

interface FormCastracaoProps {
  onVerProtocolo?: (protocolo: string) => void;
}

export function FormCastracao({ onVerProtocolo }: FormCastracaoProps) {
  const [tipoServico, setTipoServico] = useState<TipoServicoPet>("CASTRACAO");
  const [nomeTutor, setNomeTutor] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [municipio, setMunicipio] = useState("");

  const [nomePet, setNomePet] = useState("");
  const [especie, setEspecie] = useState<Especie>("CACHORRO");
  const [sexo, setSexo] = useState<Sexo>("FEMEA");
  const [pesoKg, setPesoKg] = useState("");
  const [idadeEstimada, setIdadeEstimada] = useState("");
  const [observacoesSaude, setObservacoesSaude] = useState("");
  const [aceitouTermosLGPD, setAceitouTermosLGPD] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protocoloSucesso, setProtocoloSucesso] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!aceitouTermosLGPD) {
      setError("Você precisa aceitar os termos de consentimento e LGPD.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tipoServico", tipoServico);
      formData.append("nomeTutor", nomeTutor);
      formData.append("whatsapp", whatsapp);
      formData.append("endereco", endereco);
      formData.append("bairro", bairro);
      formData.append("municipio", municipio);
      formData.append("nomePet", nomePet);
      formData.append("especie", especie);
      formData.append("sexo", sexo);
      formData.append("pesoKg", pesoKg);
      if (idadeEstimada.trim()) formData.append("idadeEstimada", idadeEstimada);
      if (observacoesSaude.trim()) {
        formData.append("observacoesSaude", observacoesSaude);
      }
      formData.append("aceitouTermosLGPD", String(aceitouTermosLGPD));

      const res = await criarSolicitacaoCastracao(formData);
      if (!res.success) {
        setError(res.error || "Não foi possível concluir o cadastro.");
        return;
      }

      setProtocoloSucesso(res.protocolo || "CAS-OK");
    } catch {
      setError("Ocorreu uma falha de conexão ao enviar o cadastro. Tente novamente.");
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
    setNomePet("");
    setPesoKg("");
    setIdadeEstimada("");
    setObservacoesSaude("");
    setError(null);
  }

  if (protocoloSucesso) {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-emerald-200 text-center max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
            Confirmação de Registro
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900">
            Seu caso foi registrado e já está com a equipe!
          </h2>
          <p className="text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
            O pedido de <strong>{SERVICO_CONFIG[tipoServico].label}</strong> para{" "}
            <strong>{nomePet}</strong> ({municipio}) foi salvo com sucesso. Quando
            houver avanço na fila ou agendamento, nossa equipe enviará o aviso direto no
            seu WhatsApp.
          </p>
        </div>

        <div className="p-5 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 max-w-md mx-auto space-y-2">
          <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider block">
            Protocolo de Acompanhamento
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

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 max-w-md mx-auto">
          <strong>Status Atual:</strong> Caso Registrado — Aguardando avaliação da
          equipe para seu município.
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {onVerProtocolo && (
            <button
              type="button"
              onClick={() => onVerProtocolo(protocoloSucesso)}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Acompanhar Status do Protocolo</span>
            </button>
          )}

          <button
            type="button"
            onClick={resetarFormulario}
            className="px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-sm rounded-xl transition cursor-pointer"
          >
            Cadastrar Outro Pet
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-neutral-200/80 space-y-8"
    >
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold">
          {error}
        </div>
      )}

      {/* 1. TIPO DE SERVIÇO */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Syringe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              1. Serviço Solicitado
            </h3>
            <p className="text-xs text-neutral-500">
              Escolha se o seu pet precisa de castração, vacinação ou ambos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            ["CASTRACAO", "VACINACAO", "CASTRACAO_E_VACINACAO"] as TipoServicoPet[]
          ).map((tipo) => {
            const info = SERVICO_CONFIG[tipo];
            const selecionado = tipoServico === tipo;
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => setTipoServico(tipo)}
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

      {/* 2. DADOS DO TUTOR */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              2. Dados do Tutor Responsável
            </h3>
            <p className="text-xs text-neutral-500">
              Utilizado para confirmação e envio dos avisos de status pelo WhatsApp
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Nome Completo do Tutor *
            </label>
            <input
              type="text"
              required
              value={nomeTutor}
              onChange={(e) => setNomeTutor(e.target.value)}
              placeholder="Ex: Maria da Silva"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              WhatsApp para Aviso de Status (com DDD) *
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
        </div>
      </div>

      {/* 3. ENDEREÇO & MUNICÍPIO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              3. Endereço &amp; Município
            </h3>
            <p className="text-xs text-neutral-500">
              Necessário para organizar a fila de mutirões e clínicas por cidade
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-12 space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Endereço Completo (Rua, Avenida, Número e Complemento) *
            </label>
            <input
              type="text"
              required
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Ex: Rua das Palmeiras, nº 120, Casa B"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-6 space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Bairro *
            </label>
            <input
              type="text"
              required
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Ex: Jardim Camburi"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-6 space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Município *
            </label>
            <input
              type="text"
              required
              list="municipios-sugeridos"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              placeholder="Digite o seu município (Ex: Vitória)"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <datalist id="municipios-sugeridos">
              {MUNICIPIOS_SUGERIDOS.map((cidade) => (
                <option key={cidade} value={cidade} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* 4. DADOS DO PET */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <PawPrint className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              4. Informações do Pet
            </h3>
            <p className="text-xs text-neutral-500">
              O peso aproximado é fundamental para o cálculo seguro da medicação
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6 space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Nome do Pet *
            </label>
            <input
              type="text"
              required
              value={nomePet}
              onChange={(e) => setNomePet(e.target.value)}
              placeholder="Ex: Rex, Luna, Pipoca..."
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Espécie *
            </label>
            <select
              value={especie}
              onChange={(e) => setEspecie(e.target.value as Especie)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="CACHORRO">Cachorro</option>
              <option value="GATO">Gato</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Sexo *
            </label>
            <select
              value={sexo}
              onChange={(e) => setSexo(e.target.value as Sexo)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="FEMEA">Fêmea</option>
              <option value="MACHO">Macho</option>
            </select>
          </div>

          <div className="sm:col-span-6 space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Peso Aproximado do Pet (kg) *
            </label>
            <input
              type="text"
              inputMode="decimal"
              required
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
              placeholder="Ex: 12,5"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-6 space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Idade Estimada (Opcional)
            </label>
            <input
              type="text"
              value={idadeEstimada}
              onChange={(e) => setIdadeEstimada(e.target.value)}
              placeholder="Ex: 8 meses ou 2 anos"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-12 space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Observações de Saúde ou Cio Recente (Opcional)
            </label>
            <textarea
              rows={3}
              value={observacoesSaude}
              onChange={(e) => setObservacoesSaude(e.target.value)}
              placeholder="Informe se o pet toma alguma medicação, se teve cio recentemente, se é bravo com estranhos ou já tomou vacinas antes..."
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
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
            Autorizo a ONG Esperança Animal a utilizar estes dados exclusivamente para
            avaliação e envio de avisos sobre este protocolo no meu WhatsApp (LGPD).
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
              <span>Registrando Solicitação...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>Registrar Pet para Castração / Vacina</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

