"use client";

import { useState } from "react";
import { atualizarStatusAdocao } from "@/actions/adocao";
import { StatusAdocao, TipoMoradia, Especie, Porte, Sexo } from "@prisma/client";
import { formatarEspecieBadge, formatarPorteAnimal } from "@/lib/animal-labels";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  Loader2,
  Home,
} from "lucide-react";

export interface SolicitacaoAdocaoData {
  id: string;
  protocolo: string;
  nomeAdotante: string;
  cpf: string;
  email: string;
  whatsapp: string;
  dataNascimento: Date | string;
  cep: string;
  enderecoCompleto: string;
  bairro: string;
  cidade: string;
  estado: string;
  tipoMoradia: TipoMoradia;
  imovelProprio: boolean;
  proprietarioPermite: boolean;
  todosConcordam: boolean;
  possuiOutrosAnimais: boolean;
  detalhesOutrosAnimais?: string | null;
  horasAnimalSozinho: number;
  cienteCustosMensais: boolean;
  motivoAdocao: string;
  scoreTriagem: number;
  observacoesSistema?: string | null;
  observacoesVoluntario?: string | null;
  status: StatusAdocao;
  createdAt: Date | string;
  animal: {
    id: string;
    nome: string;
    slug: string;
    especie: Especie;
    raca: string;
    porte: Porte;
    sexo: Sexo;
    exigeTelaProtecao: boolean;
    fotos: { url: string }[];
  };
  avaliadoPor?: {
    nome: string;
    email: string;
  } | null;
}

export function AdocaoCardAdmin({ solicitacao }: { solicitacao: SolicitacaoAdocaoData }) {
  const [status, setStatus] = useState<StatusAdocao>(solicitacao.status);
  const [observacoes, setObservacoes] = useState(solicitacao.observacoesVoluntario || "");
  const [loading, setLoading] = useState(false);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [msgSucesso, setMsgSucesso] = useState(false);

  // Status visual mapping
  const statusConfig: Record<StatusAdocao, { label: string; badge: string }> = {
    RECEBIDO: {
      label: "Recebida",
      badge: "bg-neutral-100 text-neutral-800 border-neutral-300",
    },
    TRIAGEM_APROVADA: {
      label: "Triagem Aprovada",
      badge: "bg-blue-100 text-blue-800 border-blue-200",
    },
    ENTREVISTA_AGENDADA: {
      label: "Entrevista Agendada",
      badge: "bg-purple-100 text-purple-800 border-purple-200",
    },
    APROVADO: {
      label: "Adoção Aprovada",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    RECUSADO: {
      label: "Recusada",
      badge: "bg-red-100 text-red-800 border-red-200",
    },
    CANCELADO: {
      label: "Cancelada",
      badge: "bg-neutral-200 text-neutral-600 border-neutral-300",
    },
  };

  // Moradia labels
  const moradiaLabels: Record<TipoMoradia, string> = {
    CASA_QUINTAL_FECHADO: "Casa com quintal murado/fechado",
    CASA_QUINTAL_ABERTO: "Casa com quintal aberto",
    APARTAMENTO_TELADO: "Apartamento 100% com telas de proteção",
    APARTAMENTO_SEM_TELA: "Apartamento SEM telas de proteção",
    SITIO_CHACARA: "Sítio / Chácara",
  };

  // Cálculo da idade do adotante
  const dataNasc = new Date(solicitacao.dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNasc.getFullYear();
  const m = hoje.getMonth() - dataNasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < dataNasc.getDate())) {
    idade--;
  }

  // Score visual
  const isScoreAlto = solicitacao.scoreTriagem >= 80;
  const isScoreMedio = solicitacao.scoreTriagem >= 50 && solicitacao.scoreTriagem < 80;
  const scoreBadge = isScoreAlto
    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
    : isScoreMedio
    ? "bg-amber-100 text-amber-800 border-amber-300"
    : "bg-red-100 text-red-800 border-red-300";

  const scoreBorder = isScoreAlto
    ? "border-l-4 border-l-emerald-500"
    : isScoreMedio
    ? "border-l-4 border-l-amber-500"
    : "border-l-4 border-l-red-500";

  async function handleSalvarStatus(novoStatus: StatusAdocao) {
    setStatus(novoStatus);
    setLoading(true);
    setMsgSucesso(false);

    try {
      const res = await atualizarStatusAdocao({
        solicitacaoId: solicitacao.id,
        status: novoStatus,
        observacoesVoluntario: observacoes,
      });

      if (res.success) {
        setMsgSucesso(true);
        setTimeout(() => setMsgSucesso(false), 3000);
      } else {
        alert("Erro ao atualizar: " + res.error);
      }
    } catch {
      alert("Falha na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  const dataFormatada = new Date(solicitacao.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const wppNumero = solicitacao.whatsapp.replace(/\D/g, "");
  const wppMsg = encodeURIComponent(
    `Olá, ${solicitacao.nomeAdotante}! Aqui é da equipe do Projeto Esperança Animal sobre sua solicitação de adoção para o pet ${solicitacao.animal.nome} (Protocolo: ${solicitacao.protocolo}). Poderíamos conversar?`
  );

  const fotoAnimalUrl =
    solicitacao.animal.fotos[0]?.url ||
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400";

  return (
    <div
      className={`bg-white rounded-3xl shadow-sm border border-neutral-200/80 p-5 sm:p-6 space-y-5 transition ${scoreBorder}`}
    >
      {/* ========================================================
          1. CABEÇALHO DO CARD (PROTOCOLO + SCORES + STATUS)
      ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900 bg-neutral-100 px-3 py-1 rounded-xl">
            {solicitacao.protocolo}
          </span>

          <span
            className={`text-xs font-black px-3 py-1 rounded-xl border flex items-center gap-1.5 ${scoreBadge}`}
          >
            <span>Score: {solicitacao.scoreTriagem}/100</span>
            <span className="text-[10px] font-medium opacity-85">
              ({isScoreAlto ? "Alta Compatibilidade" : isScoreMedio ? "Média" : "Atenção"})
            </span>
          </span>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-xl border ${statusConfig[status]?.badge}`}
          >
            {statusConfig[status]?.label}
          </span>
        </div>

        <div className="text-xs text-neutral-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Recebido em {dataFormatada}</span>
        </div>
      </div>

      {/* ========================================================
          2. CORPO PRINCIPAL (ANIMAL ALVO + DADOS DO CANDIDATO)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Bloco do Animal Solicitado (4 colunas) */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 flex items-center gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoAnimalUrl}
            alt={solicitacao.animal.nome}
            className="w-16 h-16 rounded-xl object-cover border border-neutral-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Pet Pretendido
            </span>
            <h4 className="text-base font-black text-neutral-900 truncate">
              {solicitacao.animal.nome}
            </h4>
            <p className="text-xs text-neutral-500 truncate">
              {formatarEspecieBadge(solicitacao.animal.especie)} • {formatarPorteAnimal(solicitacao.animal.porte)}
            </p>
            {solicitacao.animal.exigeTelaProtecao && (
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                Exige Janelas Teladas
              </span>
            )}
          </div>
        </div>

        {/* Bloco do Adotante (8 colunas) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                {solicitacao.nomeAdotante}
              </h3>
              <p className="text-xs text-neutral-500">
                {idade} anos • CPF: {solicitacao.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${wppNumero}?text=${wppMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Conversar no WhatsApp</span>
              </a>

              <a
                href={`mailto:${solicitacao.email}`}
                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                title={solicitacao.email}
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">
                {solicitacao.bairro}, {solicitacao.cidade} - {solicitacao.estado}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{moradiaLabels[solicitacao.tipoMoradia]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. PARECER DO MOTOR DE PRÉ-TRIAGEM AUTOMATIZADA
      ======================================================== */}
      {solicitacao.observacoesSistema && (
        <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-neutral-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Diagnóstico do Motor de Triagem:</span>
          </div>
          <p className="leading-relaxed pl-5">
            {solicitacao.observacoesSistema}
          </p>
        </div>
      )}

      {/* ========================================================
          4. GAVETA EXPANSÍVEL: QUESTIONÁRIO COMPLETO
      ======================================================== */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
          className="w-full py-2.5 px-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 text-xs font-bold text-neutral-700 flex items-center justify-between transition"
        >
          <span>{mostrarDetalhes ? "Ocultar Questionário da Triagem" : "Ver Respostas do Formulário Completo"}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              mostrarDetalhes ? "rotate-180" : ""
            }`}
          />
        </button>

        {mostrarDetalhes && (
          <div className="mt-3 p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-neutral-900 block mb-1">
                  1. Moradia e Estrutura
                </span>
                <ul className="space-y-1 text-neutral-600">
                  <li>• <strong>Tipo:</strong> {moradiaLabels[solicitacao.tipoMoradia]}</li>
                  <li>• <strong>Imóvel:</strong> {solicitacao.imovelProprio ? "Próprio" : "Alugado"}</li>
                  {!solicitacao.imovelProprio && (
                    <li>
                      • <strong>Autorização do proprietário:</strong>{" "}
                      {solicitacao.proprietarioPermite ? "Sim, permite animais" : "NÃO PERMITE (Alerta!)"}
                    </li>
                  )}
                  <li>• <strong>Endereço Completo:</strong> {solicitacao.enderecoCompleto} (CEP {solicitacao.cep})</li>
                </ul>
              </div>

              <div>
                <span className="font-bold text-neutral-900 block mb-1">
                  2. Convivência e Rotina
                </span>
                <ul className="space-y-1 text-neutral-600">
                  <li>
                    • <strong>Concordância familiar:</strong>{" "}
                    {solicitacao.todosConcordam ? "Todos de acordo ✓" : "NEM TODOS CONCORDAM (Risco!)"}
                  </li>
                  <li>
                    • <strong>Outros animais em casa:</strong>{" "}
                    {solicitacao.possuiOutrosAnimais ? `Sim (${solicitacao.detalhesOutrosAnimais || "Não detalhado"})` : "Não"}
                  </li>
                  <li>• <strong>Horas que o pet ficará sozinho:</strong> {solicitacao.horasAnimalSozinho}h por dia</li>
                  <li>• <strong>Ciente dos custos médicos/ração:</strong> {solicitacao.cienteCustosMensais ? "Sim" : "Não"}</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200">
              <span className="font-bold text-neutral-900 block mb-1">
                Motivo da Adoção declarado pelo solicitante:
              </span>
              <p className="italic text-neutral-700 bg-white p-3 rounded-xl border border-neutral-200 leading-relaxed">
                &ldquo;{solicitacao.motivoAdocao}&rdquo;
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          5. CONTROLES DE AÇÃO DO VOLUNTÁRIO (STATUS + PARECER)
      ======================================================== */}
      <div className="pt-3 border-t border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-bold text-neutral-700">Mudar Status:</label>
          <select
            value={status}
            disabled={loading}
            onChange={(e) => handleSalvarStatus(e.target.value as StatusAdocao)}
            className="text-xs px-3.5 py-2 rounded-xl border border-neutral-200 bg-neutral-50 font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value={StatusAdocao.RECEBIDO}>Recebida (Pendente)</option>
            <option value={StatusAdocao.TRIAGEM_APROVADA}>Triagem Aprovada</option>
            <option value={StatusAdocao.ENTREVISTA_AGENDADA}>Agendar Entrevista</option>
            <option value={StatusAdocao.APROVADO}>Aprovar Adoção Definitiva</option>
            <option value={StatusAdocao.RECUSADO}>Recusar Candidatura</option>
            <option value={StatusAdocao.CANCELADO}>Candidato Desistiu</option>
          </select>

          {loading && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
          {msgSucesso && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
              <CheckCircle2 className="w-4 h-4" /> Salvo com sucesso!
            </span>
          )}
        </div>

        {solicitacao.avaliadoPor && (
          <div className="text-xs text-neutral-400">
            Última avaliação por: <strong>{solicitacao.avaliadoPor.nome}</strong>
          </div>
        )}
      </div>

      {/* Campo de Parecer / Anotações do Voluntário */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold text-neutral-600 block">
          Anotações Internas do Voluntário / Histórico de Entrevista:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex: Entrevista feita via WhatsApp. Adotante tem espaço excelente e marcou visita no abrigo sábado às 14h."
            className="flex-1 px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-800"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSalvarStatus(status)}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shrink-0"
          >
            Salvar Nota
          </button>
        </div>
      </div>
    </div>
  );
}
