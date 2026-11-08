"use client";

import { useState } from "react";
import { alternarPublicacaoNoticia, excluirNoticia } from "@/actions/noticia";
import { Eye, Pencil, Trash2, Loader2, Clock, Calendar } from "lucide-react";
import Link from "next/link";

export interface NoticiaAdminData {
  id: string;
  titulo: string;
  slug: string;
  subtitulo?: string | null;
  categoria: string;
  publicado: boolean;
  tempoLeituraMin: number;
  autorNome: string;
  imagemCapaUrl?: string | null;
  createdAt: Date | string;
}

export function NoticiaCardAdmin({ noticia }: { noticia: NoticiaAdminData }) {
  const [publicado, setPublicado] = useState(noticia.publicado);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [loadingExcluir, setLoadingExcluir] = useState(false);

  async function handleTogglePublicado() {
    const novoStatus = !publicado;
    setPublicado(novoStatus);
    setLoadingToggle(true);

    try {
      const res = await alternarPublicacaoNoticia({
        id: noticia.id,
        publicado: novoStatus,
      });

      if (!res.success) {
        setPublicado(!novoStatus);
        alert("Erro ao alterar publicação: " + res.error);
      }
    } catch {
      setPublicado(!novoStatus);
      alert("Falha de conexão com o servidor.");
    } finally {
      setLoadingToggle(false);
    }
  }

  async function handleExcluir() {
    if (!confirm(`Tem certeza que deseja excluir permanentemente a matéria "${noticia.titulo}"?`)) {
      return;
    }

    setLoadingExcluir(true);
    try {
      const res = await excluirNoticia({ id: noticia.id });
      if (!res.success) {
        alert("Erro ao excluir: " + res.error);
      }
    } catch {
      alert("Falha de conexão.");
    } finally {
      setLoadingExcluir(false);
    }
  }

  const dataFormatada = new Date(noticia.createdAt).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const capaUrl =
    noticia.imagemCapaUrl ||
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400";

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 shadow-xs hover:shadow-md transition duration-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Imagem + Infos da Matéria */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={capaUrl} alt={noticia.titulo} className="w-full h-full object-cover" />
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
              {noticia.categoria}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                publicado
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {publicado ? "Publicado ✓" : "Rascunho"}
            </span>
          </div>

          <h3 className="text-sm font-black text-neutral-900 truncate max-w-lg">
            {noticia.titulo}
          </h3>

          <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {dataFormatada}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {noticia.tempoLeituraMin} min
            </span>
            <span>•</span>
            <span>Por: {noticia.autorNome}</span>
          </div>
        </div>
      </div>

      {/* Ações do Administrador */}
      <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
        {/* Alternar Rascunho / Publicado */}
        <button
          type="button"
          onClick={handleTogglePublicado}
          disabled={loadingToggle}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
            publicado
              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
              : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-300"
          }`}
        >
          {loadingToggle ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <span>{publicado ? "Publicado" : "Tornar Público"}</span>
          )}
        </button>

        {/* Ver na Vitrine Pública */}
        {publicado && (
          <Link
            href={`/noticias/${noticia.slug}`}
            target="_blank"
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
            title="Visualizar no site"
          >
            <Eye className="w-4 h-4" />
          </Link>
        )}

        {/* Editar */}
        <Link
          href={`/dashboard/noticias/${noticia.id}/editar`}
          className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700"
        >
          <Pencil className="w-3.5 h-3.5 text-neutral-600" />
          <span>Editar</span>
        </Link>

        {/* Excluir */}
        <button
          type="button"
          onClick={handleExcluir}
          disabled={loadingExcluir}
          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition border border-red-200"
          title="Excluir notícia"
        >
          {loadingExcluir ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
