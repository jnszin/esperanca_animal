"use client";

import { useState } from "react";
import Link from "next/link";
import { TipoMoradia, Animal } from "@prisma/client";
import { submeterSolicitacaoAdocao } from "@/actions/adocao";
import {
  CONTATO_ONG_ADOCAO,
  formatarEspecieBadge,
  formatarPorteAnimal,
} from "@/lib/animal-labels";
import {
  PawPrint,
  User,
  Home,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Sparkles,
  Copy,
  PhoneCall,
} from "lucide-react";

interface FormAdocaoMultistepProps {
  animal: Pick<Animal, "id" | "nome" | "slug" | "especie" | "porte" | "exigeTelaProtecao">;
  fotoUrl?: string;
}

export function FormAdocaoMultistep({ animal, fotoUrl }: FormAdocaoMultistepProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resultado de Sucesso
  const [protocoloGerado, setProtocoloGerado] = useState<string | null>(null);
  const [scoreFinal, setScoreFinal] = useState<number | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function handleCopiarProtocolo() {
    if (!protocoloGerado) return;
    try {
      await navigator.clipboard.writeText(protocoloGerado);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Clipboard indisponível
    }
  }

  // Estados dos Campos
  // Etapa 1: Dados Pessoais
  const [nomeAdotante, setNomeAdotante] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cep, setCep] = useState("");
  const [enderecoCompleto, setEnderecoCompleto] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("ES");

  // Etapa 2: Moradia & Ambiente
  const [tipoMoradia, setTipoMoradia] = useState<TipoMoradia>(TipoMoradia.CASA_QUINTAL_FECHADO);
  const [imovelProprio, setImovelProprio] = useState(true);
  const [proprietarioPermite, setProprietarioPermite] = useState(true);
  const [todosConcordam, setTodosConcordam] = useState(true);

  // Etapa 3: Rotina & Convivência
  const [possuiOutrosAnimais, setPossuiOutrosAnimais] = useState(false);
  const [detalhesOutrosAnimais, setDetalhesOutrosAnimais] = useState("");
  const [horasAnimalSozinho, setHorasAnimalSozinho] = useState(4);
  const [cienteCustosMensais, setCienteCustosMensais] = useState(false);
  const [motivoAdocao, setMotivoAdocao] = useState("");
  const [aceitouTermosLGPD, setAceitouTermosLGPD] = useState(false);

  // Validação da Etapa 1
  function handleNextStep1(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nomeAdotante || !cpf || !email || !whatsapp || !dataNascimento || !enderecoCompleto || !bairro || !cidade) {
      setError("Por favor, preencha todos os campos obrigatórios da Etapa 1.");
      return;
    }

    setStep(2);
  }

  // Validação da Etapa 2
  function handleNextStep2(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStep(3);
  }

  // Envio Final (Etapa 3 -> Server Action)
  async function handleSubmitFinal(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!cienteCustosMensais) {
      setError("É necessário confirmar ciência dos custos com saúde e alimentação.");
      return;
    }

    if (!aceitouTermosLGPD) {
      setError("É necessário concordar com os termos de consentimento e LGPD.");
      return;
    }

    if (motivoAdocao.trim().length < 15) {
      setError("Por favor, escreva um pouco mais sobre o motivo da sua adoção (mínimo 15 caracteres).");
      return;
    }

    setLoading(true);

    try {
      const result = await submeterSolicitacaoAdocao({
        animalId: animal.id,
        nomeAdotante,
        cpf,
        email,
        whatsapp,
        dataNascimento,
        cep: cep || "29000000",
        enderecoCompleto,
        bairro,
        cidade,
        estado,
        tipoMoradia,
        imovelProprio,
        proprietarioPermite,
        todosConcordam,
        possuiOutrosAnimais,
        detalhesOutrosAnimais: possuiOutrosAnimais ? detalhesOutrosAnimais : null,
        horasAnimalSozinho: Number(horasAnimalSozinho),
        cienteCustosMensais: true,
        motivoAdocao,
        aceitouTermosLGPD: true,
      });

      if (!result.success) {
        setError(result.error || "Falha ao processar solicitação.");
        setLoading(false);
        return;
      }

      setProtocoloGerado(result.protocolo || null);
      setScoreFinal(result.scoreTriagem ?? null);
      setStep(4);
    } catch {
      setError("Ocorreu um erro inesperado ao submeter o formulário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
      {/* Header do Card com Resumo do Pet */}
      <div className="bg-neutral-900 text-white p-6 sm:p-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {fotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoUrl}
              alt={animal.nome}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 flex-shrink-0"
            />
          )}
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">
              Formulário de Pré-Triagem
            </span>
            <h2 className="text-xl sm:text-2xl font-black">Adotando o pet: {animal.nome}</h2>
            <p className="text-xs text-neutral-400">
              {formatarEspecieBadge(animal.especie)} • {formatarPorteAnimal(animal.porte)}
            </p>
          </div>
        </div>

        {animal.exigeTelaProtecao && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Exige Telas</span>
          </div>
        )}
      </div>

      {/* Barra de Progresso das Etapas */}
      {step < 4 && (
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 1 ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              1
            </span>
            <span className="text-xs font-semibold text-neutral-700 hidden sm:inline">
              Dados do Adotante
            </span>
          </div>

          <div className="h-0.5 w-12 bg-neutral-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 2
                  ? "bg-emerald-600 text-white"
                  : step > 2
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-neutral-200 text-neutral-500"
              }`}
            >
              2
            </span>
            <span className="text-xs font-semibold text-neutral-700 hidden sm:inline">
              Moradia & Espaço
            </span>
          </div>

          <div className="h-0.5 w-12 bg-neutral-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 3 ? "bg-emerald-600 text-white" : "bg-neutral-200 text-neutral-500"
              }`}
            >
              3
            </span>
            <span className="text-xs font-semibold text-neutral-700 hidden sm:inline">
              Rotina & Conclusão
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="m-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================
          ETAPA 1: DADOS DO ADOTANTE (LGPD)
      ======================================================== */}
      {step === 1 && (
        <form onSubmit={handleNextStep1} className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 pb-2 border-b border-neutral-100">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Passo 1: Suas Informações de Contato</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={nomeAdotante}
                onChange={(e) => setNomeAdotante(e.target.value)}
                placeholder="Ex: Maria da Silva"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                CPF *
              </label>
              <input
                type="text"
                required
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Data de Nascimento *
              </label>
              <input
                type="date"
                required
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                E-mail *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                WhatsApp com DDD * (Receberá o protocolo)
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(27) 99999-9999"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Endereço Completo com Número e Complemento *
              </label>
              <input
                type="text"
                required
                value={enderecoCompleto}
                onChange={(e) => setEnderecoCompleto(e.target.value)}
                placeholder="Rua das Flores, 123, Bloco B Apto 302"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                CEP
              </label>
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="29000-000"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Estado *
              </label>
              <input
                type="text"
                required
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                placeholder="ES"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Bairro *
              </label>
              <input
                type="text"
                required
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Jardim Camburi"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Cidade *
              </label>
              <input
                type="text"
                required
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Vitória"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition"
            >
              <span>Avançar para Moradia</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* ========================================================
          ETAPA 2: MORADIA & AMBIENTE SEGURO
      ======================================================== */}
      {step === 2 && (
        <form onSubmit={handleNextStep2} className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 pb-2 border-b border-neutral-100">
            <Home className="w-4 h-4 text-emerald-600" />
            <span>Passo 2: Condições do Imóvel & Proteção</span>
          </div>

          {animal.exigeTelaProtecao && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Atenção às Telas:</strong> O pet {animal.nome} exige janelas
                e sacadas com telas de proteção por questões de segurança e prevenção
                de quedas.
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-2">
                Tipo de Moradia *
              </label>
              <select
                value={tipoMoradia}
                onChange={(e) => setTipoMoradia(e.target.value as TipoMoradia)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              >
                <option value={TipoMoradia.CASA_QUINTAL_FECHADO}>
                  Casa com quintal totalmente murado/fechado
                </option>
                <option value={TipoMoradia.APARTAMENTO_TELADO}>
                  Apartamento com telas de proteção instaladas
                </option>
                <option value={TipoMoradia.APARTAMENTO_SEM_TELA}>
                  Apartamento SEM telas de proteção
                </option>
                <option value={TipoMoradia.CASA_QUINTAL_ABERTO}>
                  Casa com quintal aberto ou portão gradeado
                </option>
                <option value={TipoMoradia.SITIO_CHACARA}>
                  Sítio / Chácara
                </option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-2">
                <span className="block text-xs font-bold text-neutral-800">
                  O imóvel é próprio?
                </span>
                <div className="flex gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="proprio"
                      checked={imovelProprio}
                      onChange={() => setImovelProprio(true)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Sim, próprio</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="proprio"
                      checked={!imovelProprio}
                      onChange={() => setImovelProprio(false)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Alugado</span>
                  </label>
                </div>
              </div>

              {!imovelProprio && (
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-2">
                  <span className="block text-xs font-bold text-neutral-800">
                    O proprietário permite animais?
                  </span>
                  <div className="flex gap-4 text-xs font-semibold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="permite"
                        checked={proprietarioPermite}
                        onChange={() => setProprietarioPermite(true)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Sim, permite</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="permite"
                        checked={!proprietarioPermite}
                        onChange={() => setProprietarioPermite(false)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Não permite</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-2">
              <span className="block text-xs font-bold text-neutral-800">
                Todos na residência estão de acordo com a adoção? *
              </span>
              <div className="flex gap-4 text-xs font-semibold">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="concordam"
                    checked={todosConcordam}
                    onChange={() => setTodosConcordam(true)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Sim, todos apoiam</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="concordam"
                    checked={!todosConcordam}
                    onChange={() => setTodosConcordam(false)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Há divergências</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-3 text-neutral-600 hover:text-neutral-900 text-xs font-bold flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            <button
              type="submit"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition"
            >
              <span>Avançar para Rotina</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* ========================================================
          ETAPA 3: ROTINA & CONVIVÊNCIA
      ======================================================== */}
      {step === 3 && (
        <form onSubmit={handleSubmitFinal} className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 pb-2 border-b border-neutral-100">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Passo 3: Rotina, Custos & Compromisso</span>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Quantas horas por dia o pet ficará sozinho? ({horasAnimalSozinho} horas)
              </label>
              <input
                type="range"
                min="0"
                max="16"
                value={horasAnimalSozinho}
                onChange={(e) => setHorasAnimalSozinho(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-neutral-400 font-medium">
                <span>0h (Sempre com alguém)</span>
                <span>8h (Horário comercial)</span>
                <span>16h</span>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-3">
              <span className="block text-xs font-bold text-neutral-800">
                Já possui outros animais na casa?
              </span>
              <div className="flex gap-4 text-xs font-semibold">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="outrosAnimais"
                    checked={possuiOutrosAnimais}
                    onChange={() => setPossuiOutrosAnimais(true)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Sim</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="outrosAnimais"
                    checked={!possuiOutrosAnimais}
                    onChange={() => setPossuiOutrosAnimais(false)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Não</span>
                </label>
              </div>

              {possuiOutrosAnimais && (
                <input
                  type="text"
                  value={detalhesOutrosAnimais}
                  onChange={(e) => setDetalhesOutrosAnimais(e.target.value)}
                  placeholder="Ex: 1 cão fêmea de 3 anos castrada"
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Por que você deseja adotar o {animal.nome}? *
              </label>
              <textarea
                required
                rows={3}
                value={motivoAdocao}
                onChange={(e) => setMotivoAdocao(e.target.value)}
                placeholder="Conte-nos brevemente o que motivou a escolha deste pet..."
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* Checkboxes de Confirmação e LGPD */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={cienteCustosMensais}
                  onChange={(e) => setCienteCustosMensais(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                />
                <span className="text-xs text-emerald-950 font-medium leading-relaxed">
                  Estou ciente de que a adoção envolve custos mensais contínuos com
                  ração de qualidade, vacinas anuais e assistência veterinária.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={aceitouTermosLGPD}
                  onChange={(e) => setAceitouTermosLGPD(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                />
                <span className="text-xs text-neutral-600 leading-relaxed">
                  Concordo com os termos da LGPD e autorizo o Projeto Esperança Animal a
                  utilizar meus dados e WhatsApp exclusivamente para contato sobre este
                  processo de adoção.
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-3 text-neutral-600 hover:text-neutral-900 text-xs font-bold flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/25 text-sm flex items-center gap-2 transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculando Compatibilidade...</span>
                </>
              ) : (
                <>
                  <PawPrint className="w-4 h-4" />
                  <span>Enviar Solicitação de Adoção</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================
          ETAPA 4: SUCESSO & PROTOCOLO GERADO
      ======================================================== */}
      {step === 4 && protocoloGerado && (
        <div className="p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
              Solicitação Registrada com Sucesso!
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-neutral-950 font-mono">
              {protocoloGerado}
            </h3>
            <button
              type="button"
              onClick={handleCopiarProtocolo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiado ? "Protocolo copiado!" : "Copiar protocolo"}</span>
            </button>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Sua ficha de adoção para <strong>{animal.nome}</strong> já foi salva no
              painel do projeto. Guarde seu código de protocolo ou envie diretamente no nosso
              WhatsApp.
            </p>
          </div>

          {scoreFinal !== null && (
            <div className="inline-flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-left">
              <Sparkles className="w-6 h-6 text-emerald-600" />
              <div>
                <span className="text-[11px] font-bold text-neutral-500 block uppercase">
                  Score de Triagem Inicial
                </span>
                <span className="text-lg font-black text-emerald-700">
                  {scoreFinal}/100 pontos de compatibilidade
                </span>
              </div>
            </div>
          )}

          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-left space-y-2 max-w-lg mx-auto">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>O que acontece agora?</span>
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Nossos voluntários analisarão sua ficha com carinho e entrarão em contato pelo
              WhatsApp informado para conversar e combinar os próximos passos da adoção de{" "}
              {animal.nome}.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/${CONTATO_ONG_ADOCAO.whatsappE164}?text=${encodeURIComponent(
                `Olá! Acabei de enviar o formulário de adoção de *${animal.nome}* com o protocolo *${protocoloGerado}*.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Falar no WhatsApp do Projeto</span>
            </a>

            <Link
              href="/animais"
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs transition"
            >
              Voltar à Vitrine
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
