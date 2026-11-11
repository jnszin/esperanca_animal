import { requireAuth } from "@/lib/auth-checks";
import { prisma } from "@/lib/prisma";
import { NoticiaCardAdmin } from "@/components/noticia-card-admin";
import Link from "next/link";
import { ArrowLeft, Newspaper, Plus } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestão do Blog & Notícias | Projeto Esperança Animal",
  description: "Painel de publicação e gerenciamento de notícias, ações e relatos do projeto.",
};

export default async function DashboardNoticiasPage() {
  await requireAuth();

  const noticias = await prisma.noticia.findMany({
    orderBy: { createdAt: "desc" },
  });

  const total = noticias.length;
  const publicados = noticias.filter((n) => n.publicado).length;
  const rascunhos = noticias.filter((n) => !n.publicado).length;

  return (
    <div className="min-h-screen bg-neutral-100/60 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navegação de Volta */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Dashboard</span>
          </Link>

          <Link
            href="/noticias"
            target="_blank"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            Ver Blog Público ↗
          </Link>
        </div>

        {/* Header do Módulo */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center font-bold">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900">
                  Blog &amp; Notícias do Projeto
                </h1>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Fase 9 • Comunicação
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Divulgação de projetos realizados, histórias de resgate, dicas veterinárias e prestação de contas comunitária
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/noticias/nova"
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Publicar Nova Notícia</span>
          </Link>
        </div>

        {/* Cards de Métricas e KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-neutral-500 block">Total de Publicações</span>
            <span className="text-2xl font-black text-neutral-900 mt-1 block">{total}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-600 block">Matérias Públicas</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{publicados}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-600 block">Rascunhos Internos</span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">{rascunhos}</span>
          </div>
        </div>

        {/* Listagem de Notícias */}
        {noticias.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-neutral-200/80 text-center space-y-3">
            <div className="w-14 h-14 bg-neutral-100 text-neutral-400 rounded-2xl mx-auto flex items-center justify-center">
              <Newspaper className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-neutral-800">
              Nenhuma matéria cadastrada ainda
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Clique no botão acima para criar seu primeiro post e compartilhar as conquistas do projeto.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <span className="text-xs font-semibold text-neutral-500 px-1">
              Exibindo <strong>{noticias.length}</strong> artigos no sistema
            </span>
            <div className="grid grid-cols-1 gap-4">
              {noticias.map((n) => (
                <NoticiaCardAdmin key={n.id} noticia={n} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
