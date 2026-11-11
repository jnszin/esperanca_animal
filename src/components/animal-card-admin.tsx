"use client";

import { useState } from "react";
import {
  atualizarStatusAnimal,
  alternarDestaqueAnimal,
  arquivarAnimal,
  restaurarAnimal,
} from "@/actions/animal";
import { StatusAnimal, Especie, Porte, Sexo } from "@prisma/client";
import {
  Star,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Pencil,
  Trash2,
  RotateCcw,
  AlertTriangle,
  X,
  Archive,
} from "lucide-react";
import {
  formatarEspecieBadge,
  formatarIdadeAproximada,
  formatarPorteAnimal,
} from "@/lib/animal-labels";
import Link from "next/link";

export interface AnimalAdminData {
  id: string;
  nome: string;
  slug: string;
  especie: Especie;
  raca: string;
  porte: Porte;
  sexo: Sexo;
  idadeEstimadaMeses: number;
  pesoKg?: number | null;
  castrado: boolean;
  vacinado: boolean;
  vermifugado: boolean;
  necessidadesEspeciais: boolean;
  descricaoSaude?: string | null;
  temperamento: string[];
  exigeTelaProtecao: boolean;
  historia: string;
  status: StatusAnimal;
  destaqueVitrine: boolean;
  ativo: boolean;
  motivoArquivamento?: string | null;
  dataArquivamento?: Date | string | null;
  createdAt: Date | string;
  fotos: { url: string }[];
}

const MOTIVOS_PRONTOS = [
  "Animal adotado por outra família (fora da plataforma)",
  "Cadastro duplicado ou preenchido por engano",
  "Animal devolvido ao tutor original / reencontro",
  "Transferido para lar temporário externo ou projeto parceiro",
  "Em tratamento veterinário intensivo (retirado temporariamente)",
  "Óbito / Falecimento do animal",
  "Outro motivo (especificar abaixo)",
];

export function AnimalCardAdmin({ animal }: { animal: AnimalAdminData }) {
  const [status, setStatus] = useState<StatusAnimal>(animal.status);
  const [destaque, setDestaque] = useState(animal.destaqueVitrine);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingDestaque, setLoadingDestaque] = useState(false);
  const [msgSucesso, setMsgSucesso] = useState(false);

  // Estados do Modal de Exclusão / Arquivamento
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [motivoSelecionado, setMotivoSelecionado] = useState(MOTIVOS_PRONTOS[0]);
  const [outroMotivoTexto, setOutroMotivoTexto] = useState("");
  const [loadingExclusao, setLoadingExclusao] = useState(false);
  const [loadingRestaurar, setLoadingRestaurar] = useState(false);

  const statusConfig: Record<StatusAnimal, { label: string; badge: string; border: string }> = {
    DISPONIVEL: {
      label: "Disponível para Adoção",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      border: "border-l-4 border-l-emerald-500",
    },
    EM_PROCESSO: {
      label: "Em Processo de Adoção",
      badge: "bg-purple-100 text-purple-800 border-purple-200",
      border: "border-l-4 border-l-purple-500",
    },
    EM_TRATAMENTO: {
      label: "Em Tratamento Veterinário",
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      border: "border-l-4 border-l-amber-500",
    },
    ADOTADO: {
      label: "Adotado (Final Feliz) ❤️",
      badge: "bg-blue-100 text-blue-800 border-blue-200",
      border: "border-l-4 border-l-blue-500",
    },
    INDISPONIVEL: {
      label: "Indisponível",
      badge: "bg-neutral-200 text-neutral-700 border-neutral-300",
      border: "border-l-4 border-l-neutral-400",
    },
    OBITO: {
      label: "Óbito (Histórico)",
      badge: "bg-neutral-900 text-white border-neutral-800",
      border: "border-l-4 border-l-neutral-900",
    },
  };

  async function handleMudarStatus(novoStatus: StatusAnimal) {
    setStatus(novoStatus);
    setLoadingStatus(true);
    setMsgSucesso(false);

    try {
      const res = await atualizarStatusAnimal({
        id: animal.id,
        status: novoStatus,
      });

      if (res.success) {
        setMsgSucesso(true);
        setTimeout(() => setMsgSucesso(false), 2500);
      } else {
        alert("Erro ao atualizar: " + res.error);
      }
    } catch {
      alert("Falha na comunicação com o servidor.");
    } finally {
      setLoadingStatus(false);
    }
  }

  async function handleAlternarDestaque() {
    const novoDestaque = !destaque;
    setDestaque(novoDestaque);
    setLoadingDestaque(true);

    try {
      const res = await alternarDestaqueAnimal({
        id: animal.id,
        destaque: novoDestaque,
      });

      if (!res.success) {
        setDestaque(!novoDestaque);
        alert("Erro ao alterar destaque: " + res.error);
      }
    } catch {
      setDestaque(!novoDestaque);
      alert("Falha na comunicação com o servidor.");
    } finally {
      setLoadingDestaque(false);
    }
  }

  async function handleConfirmarArquivamento() {
    let motivoFinal = motivoSelecionado;
    if (motivoSelecionado.startsWith("Outro") && outroMotivoTexto.trim()) {
      motivoFinal = outroMotivoTexto.trim();
    }

    setLoadingExclusao(true);
    try {
      const res = await arquivarAnimal({
        id: animal.id,
        motivo: motivoFinal,
      });

      if (res.success) {
        setModalExclusaoAberto(false);
      } else {
        alert("Erro ao arquivar pet: " + res.error);
      }
    } catch {
      alert("Falha de conexão com o servidor.");
    } finally {
      setLoadingExclusao(false);
    }
  }

  async function handleRestaurar() {
    if (!confirm(`Deseja reativar ${animal.nome} e retornar para a vitrine pública de adoção?`)) {
      return;
    }

    setLoadingRestaurar(true);
    try {
      const res = await restaurarAnimal({ id: animal.id });
      if (!res.success) {
        alert("Erro ao restaurar: " + res.error);
      }
    } catch {
      alert("Falha ao restaurar pet.");
    } finally {
      setLoadingRestaurar(false);
    }
  }

  const idadeTexto = formatarIdadeAproximada(animal.idadeEstimadaMeses);

  const fotoUrl =
    animal.fotos[0]?.url ||
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400";

  return (
    <>
      <div
        className={`bg-white rounded-3xl shadow-sm border border-neutral-200/80 p-5 space-y-4 hover:shadow-md transition duration-200 ${
          !animal.ativo
            ? "border-l-4 border-l-neutral-400 bg-neutral-50/70"
            : statusConfig[status]?.border || ""
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Bloco Foto + Infos do Pet */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fotoUrl} alt={animal.nome} className="w-full h-full object-cover" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-neutral-900 truncate">
                  {animal.nome}
                </h3>
                <span className="text-xs text-neutral-400">
                  ({animal.sexo === "MACHO" ? "Macho" : "Fêmea"})
                </span>
                {!animal.ativo && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-700">
                    Arquivado / Fora da Vitrine
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-500 truncate">
                {formatarEspecieBadge(animal.especie)} •{" "}
                {animal.raca} • ~{idadeTexto} • {formatarPorteAnimal(animal.porte)}
              </p>

              {/* Badges de Saúde */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {animal.castrado && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Castrado ✓
                  </span>
                )}
                {animal.vacinado && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    Vacinado ✓
                  </span>
                )}
                {animal.exigeTelaProtecao && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    Exige Telas
                  </span>
                )}
                {animal.necessidadesEspeciais && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    Cuidados Especiais
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Barra de Ações: Destaque + Editar + Excluir/Restaurar */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
            {animal.ativo ? (
              <>
                {/* Botão de Destaque na Home */}
                <button
                  type="button"
                  onClick={handleAlternarDestaque}
                  disabled={loadingDestaque}
                  title={destaque ? "Remover destaque da Home" : "Destacar na Home"}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                    destaque
                      ? "bg-amber-50 text-amber-800 border-amber-300 shadow-2xs"
                      : "bg-neutral-50 text-neutral-500 hover:text-neutral-800 border-neutral-200"
                  }`}
                >
                  {loadingDestaque ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Star className={`w-3.5 h-3.5 ${destaque ? "fill-amber-500 text-amber-500" : ""}`} />
                  )}
                  <span>{destaque ? "Destaque" : "Destacar"}</span>
                </button>

                {/* Botão Editar (Página Dedicada) */}
                <Link
                  href={`/dashboard/animais/${animal.id}/editar`}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700"
                  title="Editar ficha completa do animal"
                >
                  <Pencil className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Editar</span>
                </Link>

                {/* Botão Excluir / Arquivar */}
                <button
                  type="button"
                  onClick={() => setModalExclusaoAberto(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
                  title="Excluir / Arquivar da vitrine"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>

                {/* Link para Vitrine Pública */}
                <Link
                  href={`/animais/${animal.slug}`}
                  target="_blank"
                  className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                  title="Ver página pública do animal"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                {/* Animal Arquivado: Botão Restaurar */}
                <button
                  type="button"
                  onClick={handleRestaurar}
                  disabled={loadingRestaurar}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                  title="Restaurar de volta para a vitrine"
                >
                  {loadingRestaurar ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  <span>Restaurar Pet</span>
                </button>

                {/* Botão Editar Cadastro Arquivado */}
                <Link
                  href={`/dashboard/animais/${animal.id}/editar`}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700"
                >
                  <Pencil className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Editar</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Motivo do Arquivamento (quando inativo) */}
        {!animal.ativo && animal.motivoArquivamento && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <Archive className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Motivo do Arquivamento:</span>{" "}
              <span>{animal.motivoArquivamento}</span>
              {animal.dataArquivamento && (
                <span className="block text-[11px] text-amber-700 mt-0.5">
                  Arquivado em: {new Date(animal.dataArquivamento).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Controles de Status do Pet (quando ativo) */}
        {animal.ativo && (
          <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <label className="font-bold text-neutral-800">Status Operacional:</label>
              <select
                value={status}
                disabled={loadingStatus}
                onChange={(e) => handleMudarStatus(e.target.value as StatusAnimal)}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-300 bg-white font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              >
                <option value={StatusAnimal.DISPONIVEL} className="text-neutral-900 bg-white">Disponível para Adoção</option>
                <option value={StatusAnimal.EM_PROCESSO} className="text-neutral-900 bg-white">Em Processo (Entrevista)</option>
                <option value={StatusAnimal.EM_TRATAMENTO} className="text-neutral-900 bg-white">Em Tratamento Veterinário</option>
                <option value={StatusAnimal.ADOTADO} className="text-neutral-900 bg-white">Adotado (Final Feliz)</option>
                <option value={StatusAnimal.INDISPONIVEL} className="text-neutral-900 bg-white">Indisponível</option>
                <option value={StatusAnimal.OBITO} className="text-neutral-900 bg-white">Óbito (Histórico)</option>
              </select>

              {loadingStatus && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
              {msgSucesso && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Atualizado!
                </span>
              )}
            </div>

            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border self-start sm:self-auto ${
                statusConfig[status]?.badge
              }`}
            >
              {statusConfig[status]?.label}
            </span>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL DE CONFIRMAÇÃO DE EXCLUSÃO / ARQUIVAMENTO
      ======================================================== */}
      {modalExclusaoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-900">
                    Excluir / Arquivar Pet da Vitrine
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Animal: <strong>{animal.nome}</strong> ({animal.especie})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalExclusaoAberto(false)}
                className="p-1 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-neutral-600 leading-relaxed">
                Para manter a integridade dos relatórios e auditoria do projeto, o animal será
                <strong> retirado imediatamente da vitrine pública</strong> e transferido para
                a aba de <strong>Arquivados</strong>. Selecione o motivo oficial:
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-900 mb-1">
                  Selecione o Motivo da Remoção *
                </label>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {MOTIVOS_PRONTOS.map((m) => {
                    const isSelected = motivoSelecionado === m;
                    return (
                      <label
                        key={m}
                        className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition text-xs font-bold ${
                          isSelected
                            ? "bg-red-50 border-red-400 text-red-950 shadow-xs ring-1 ring-red-400"
                            : "bg-white border-neutral-200 text-neutral-900 hover:bg-neutral-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`motivo-${animal.id}`}
                          value={m}
                          checked={isSelected}
                          onChange={() => setMotivoSelecionado(m)}
                          className="w-4 h-4 text-red-600 focus:ring-red-500 border-neutral-300 shrink-0"
                        />
                        <span className="flex-1 text-neutral-900">{m}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {motivoSelecionado.startsWith("Outro") && (
                <div className="pt-1">
                  <label className="block text-xs font-bold text-neutral-900 mb-1.5">
                    Descreva o motivo detalhadamente:
                  </label>
                  <textarea
                    rows={2}
                    value={outroMotivoTexto}
                    onChange={(e) => setOutroMotivoTexto(e.target.value)}
                    placeholder="Ex: Animal transferido para o abrigo de Caçapava com acompanhamento..."
                    className="w-full text-xs p-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
              <button
                type="button"
                disabled={loadingExclusao}
                onClick={() => setModalExclusaoAberto(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={loadingExclusao}
                onClick={handleConfirmarArquivamento}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition flex items-center gap-2 shadow-md shadow-red-600/20"
              >
                {loadingExclusao ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Confirmar Exclusão</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
