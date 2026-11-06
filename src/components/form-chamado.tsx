"use client";

import { useState } from "react";
import { criarChamadoAcolhimento } from "@/actions/chamado";
import { Especie, NivelUrgencia } from "@prisma/client";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Heart,
  Loader2,
  MapPin,
  Navigation,
  PhoneCall,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";

export function FormChamado() {
  // Dados do Solicitante
  const [nomeSolicitante, setNomeSolicitante] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [podeDarLarTemporario, setPodeDarLarTemporario] = useState(false);
  const [aceitouTermosLGPD, setAceitouTermosLGPD] = useState(false);

  // Dados da Ocorrência
  const [especie, setEspecie] = useState<Especie>(Especie.CACHORRO);
  const [nivelUrgencia, setNivelUrgencia] = useState<NivelUrgencia>(NivelUrgencia.MEDIA);
  const [descricaoSituacao, setDescricaoSituacao] = useState("");
  const [enderecoOcorrencia, setEnderecoOcorrencia] = useState("");
  const [pontoReferencia, setPontoReferencia] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("Vitória");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [obtendoLocalizacao, setObtendoLocalizacao] = useState(false);

  // Upload de Fotos
  const [fotos, setFotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Estados de Controle
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protocoloSucesso, setProtocoloSucesso] = useState<string | null>(null);

  // Captura de GPS pelo Navegador
  function obterGeolocalizacao() {
    if (!navigator.geolocation) {
      alert("Seu navegador não suporta geolocalização.");
      return;
    }

    setObtendoLocalizacao(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setObtendoLocalizacao(false);
      },
      (err) => {
        console.warn("Falha ao obter GPS:", err);
        alert("Não foi possível capturar sua localização. Por favor, preencha o endereço manualmente.");
        setObtendoLocalizacao(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // Manipulação de Arquivos de Fotos
  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const novosArquivos = Array.from(e.target.files);
    const totalDisponivel = 4 - fotos.length;

    if (novosArquivos.length > totalDisponivel) {
      alert(`Você pode enviar no máximo 4 fotos por chamado.`);
    }

    const arquivosFiltrados = novosArquivos.slice(0, totalDisponivel);
    const novasPreviews = arquivosFiltrados.map((file) => URL.createObjectURL(file));

    setFotos((prev) => [...prev, ...arquivosFiltrados]);
    setPreviews((prev) => [...prev, ...novasPreviews]);
  }

  function removerFoto(index: number) {
    URL.revokeObjectURL(previews[index]);
    setFotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  // Envio do Formulário
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!aceitouTermosLGPD) {
      setError("Você precisa aceitar os termos de consentimento e LGPD para continuar.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nomeSolicitante", nomeSolicitante);
      formData.append("whatsapp", whatsapp);
      formData.append("podeDarLarTemporario", String(podeDarLarTemporario));
      formData.append("aceitouTermosLGPD", String(aceitouTermosLGPD));
      formData.append("especie", especie);
      formData.append("nivelUrgencia", nivelUrgencia);
      formData.append("descricaoSituacao", descricaoSituacao);
      formData.append("enderecoOcorrencia", enderecoOcorrencia);
      if (pontoReferencia) formData.append("pontoReferencia", pontoReferencia);
      formData.append("bairro", bairro);
      formData.append("cidade", cidade);
      if (latitude) formData.append("latitude", String(latitude));
      if (longitude) formData.append("longitude", String(longitude));

      // Anexa as fotos
      for (const foto of fotos) {
        formData.append("fotos", foto);
      }

      const res = await criarChamadoAcolhimento(formData);

      if (!res.success) {
        setError(res.error || "Não foi possível enviar o chamado.");
        setLoading(false);
        return;
      }

      setProtocoloSucesso(res.protocolo || "RES-OK");
    } catch {
      setError("Ocorreu uma falha na conexão ao enviar o chamado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Tela de Sucesso
  if (protocoloSucesso) {
    const wppMsg = encodeURIComponent(
      `Olá! Registrei o chamado de resgate com protocolo ${protocoloSucesso} na Esperança Animal.`
    );

    return (
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-neutral-200/80 text-center max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
            Chamado Registrado com Sucesso
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mt-1">
            Nossa equipe foi notificada!
          </h2>
          <p className="text-sm text-neutral-600 mt-2 max-w-lg mx-auto">
            Seu relato foi inserido na fila de triagem de acolhimento. Um protocolo foi
            enviado para o seu WhatsApp com as orientações iniciais.
          </p>
        </div>

        <div className="p-5 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 max-w-md mx-auto">
          <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider block">
            Número de Protocolo
          </span>
          <span className="text-2xl font-mono font-black text-emerald-800 tracking-wider block mt-1">
            {protocoloSucesso}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <a
            href={`https://wa.me/5527999990001?text=${wppMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Falar com o Plantão no WhatsApp</span>
          </a>

          <Link
            href="/"
            className="px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-sm rounded-xl transition"
          >
            Voltar ao Início
          </Link>
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
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================
          1. CLASSIFICAÇÃO DA URGÊNCIA
      ======================================================== */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
          Nível de Urgência da Ocorrência *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: NivelUrgencia.BAIXA,
              label: "Baixa",
              desc: "Abandonado mas estável e alimentado",
              color: "peer-checked:border-emerald-500 peer-checked:bg-emerald-50/60 peer-checked:text-emerald-900",
              badge: "bg-emerald-100 text-emerald-800",
            },
            {
              id: NivelUrgencia.MEDIA,
              label: "Média",
              desc: "Filhote, idoso ou gestante vulnerável",
              color: "peer-checked:border-amber-500 peer-checked:bg-amber-50/60 peer-checked:text-amber-900",
              badge: "bg-amber-100 text-amber-800",
            },
            {
              id: NivelUrgencia.ALTA,
              label: "Alta",
              desc: "Ferido ou doente precisando de cuidados",
              color: "peer-checked:border-orange-500 peer-checked:bg-orange-50/60 peer-checked:text-orange-900",
              badge: "bg-orange-100 text-orange-800",
            },
            {
              id: NivelUrgencia.CRITICA,
              label: "Crítica",
              desc: "Risco iminente de morte / atropelamento",
              color: "peer-checked:border-red-600 peer-checked:bg-red-50/60 peer-checked:text-red-900",
              badge: "bg-red-100 text-red-800",
            },
          ].map((item) => (
            <label
              key={item.id}
              className="relative flex flex-col p-4 rounded-2xl border-2 border-neutral-200 cursor-pointer hover:border-neutral-300 transition has-checked:shadow-sm"
            >
              <input
                type="radio"
                name="nivelUrgencia"
                value={item.id}
                checked={nivelUrgencia === item.id}
                onChange={() => setNivelUrgencia(item.id)}
                className="peer sr-only"
              />
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-neutral-900">{item.label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badge}`}>
                  Urgência
                </span>
              </div>
              <p className="text-xs text-neutral-500 leading-snug">{item.desc}</p>
            </label>
          ))}
        </div>
      </div>

      {/* ========================================================
          2. ESPÉCIE & DESCRIÇÃO
      ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
            Espécie do Animal *
          </label>
          <select
            value={especie}
            onChange={(e) => setEspecie(e.target.value as Especie)}
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          >
            <option value={Especie.CACHORRO}>🐶 Cachorro</option>
            <option value={Especie.GATO}>🐱 Gato</option>
            <option value={Especie.OUTRO}>🐾 Outro Animal</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
            Descrição da Situação & Estado do Animal *
          </label>
          <textarea
            required
            rows={3}
            value={descricaoSituacao}
            onChange={(e) => setDescricaoSituacao(e.target.value)}
            placeholder="Ex: Cãozinho ferido na pata traseira, assustado mas manso, abrigado debaixo de um ponto de ônibus..."
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>
      </div>

      {/* ========================================================
          3. LOCALIZAÇÃO DA OCORRÊNCIA
      ======================================================== */}
      <div className="space-y-4 pt-4 border-t border-neutral-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-neutral-900">
              Onde o animal está localizado?
            </h3>
          </div>

          <button
            type="button"
            onClick={obterGeolocalizacao}
            disabled={obtendoLocalizacao}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition self-start sm:self-auto"
          >
            {obtendoLocalizacao ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span>
              {latitude ? "Localização GPS Capturada ✓" : "Usar meu GPS atual"}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Endereço / Rua / Rodovia *
            </label>
            <input
              type="text"
              required
              value={enderecoOcorrencia}
              onChange={(e) => setEnderecoOcorrencia(e.target.value)}
              placeholder="Ex: Av. Dante Michelini, próximo ao quiosque 5"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Ponto de Referência
            </label>
            <input
              type="text"
              value={pontoReferencia}
              onChange={(e) => setPontoReferencia(e.target.value)}
              placeholder="Ex: Em frente à farmácia ou praça"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Bairro *
            </label>
            <input
              type="text"
              required
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Ex: Jardim da Penha"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Cidade *
            </label>
            <input
              type="text"
              required
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex: Vitória, Vila Velha, Serra..."
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          4. FOTOS DA OCORRÊNCIA (UPLOAD COM PREVIEW)
      ======================================================== */}
      <div className="space-y-3 pt-4 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
            Fotos do Animal no Local (Máximo 4)
          </label>
          <span className="text-xs text-neutral-500 font-medium">
            {fotos.length} de 4 selecionadas
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div
              key={preview}
              className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 group shadow-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Foto da ocorrência"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removerFoto(index)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {fotos.length < 4 && (
            <label className="aspect-square rounded-2xl border-2 border-dashed border-neutral-300 hover:border-emerald-500 hover:bg-emerald-50/30 flex flex-col items-center justify-center p-4 cursor-pointer transition text-neutral-500 hover:text-emerald-700 group">
              <Camera className="w-8 h-8 mb-2 group-hover:scale-110 transition" />
              <span className="text-xs font-semibold text-center">Adicionar Foto</span>
              <span className="text-[10px] text-neutral-400 mt-0.5">JPG ou PNG</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFotoChange}
                className="sr-only"
              />
            </label>
          )}
        </div>
      </div>

      {/* ========================================================
          5. DADOS DO SOLICITANTE & LAR TEMPORÁRIO
      ======================================================== */}
      <div className="space-y-4 pt-4 border-t border-neutral-100">
        <h3 className="text-sm font-bold text-neutral-900">
          Seus Dados para Contato
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Seu Nome Completo *
            </label>
            <input
              type="text"
              required
              value={nomeSolicitante}
              onChange={(e) => setNomeSolicitante(e.target.value)}
              placeholder="Ex: Maria Silva"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Seu WhatsApp (com DDD) *
            </label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: (27) 99999-8888"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Enviaremos o comprovante e protocolo oficial para este WhatsApp.
            </p>
          </div>
        </div>

        {/* Lar Temporário */}
        <label className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition">
          <input
            type="checkbox"
            checked={podeDarLarTemporario}
            onChange={(e) => setPodeDarLarTemporario(e.target.checked)}
            className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 border-neutral-300 mt-0.5"
          />
          <div>
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              Posso oferecer Lar Temporário (LT) para este animal enquanto a ONG cuida das doações e adoção!
            </span>
            <p className="text-xs text-emerald-800 mt-0.5">
              Como o abrigo opera com capacidade limitada, acolhimentos com lar temporário
              têm prioridade imediata para suporte veterinário e alimentação.
            </p>
          </div>
        </label>

        {/* Termo LGPD */}
        <label className="flex items-start gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={aceitouTermosLGPD}
            onChange={(e) => setAceitouTermosLGPD(e.target.checked)}
            className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 border-neutral-300 mt-0.5"
          />
          <div className="text-xs text-neutral-600 leading-relaxed">
            <span className="font-semibold text-neutral-800 block mb-0.5">
              Consentimento LGPD & Veracidade das Informações
            </span>
            Declaro que as informações fornecidas são verdadeiras e autorizo a ONG
            Esperança Animal a processar meus dados exclusivamente para fins de
            atendimento a este resgate e contato via WhatsApp, nos termos da Lei Geral
            de Proteção de Dados (Lei nº 13.709/2018).
          </div>
        </label>
      </div>

      {/* ========================================================
          6. BOTÃO DE ENVIO
      ======================================================== */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/25 flex items-center justify-center gap-3 transition active:scale-[0.99] disabled:opacity-70 text-base"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processando imagens e registrando chamado...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Registrar Chamado de Emergência</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-neutral-400 mt-3 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Seus dados são protegidos com criptografia e validação em profundidade.</span>
        </p>
      </div>
    </form>
  );
}

