import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, PawPrint } from "lucide-react";
import { Metadata } from "next";

interface NoticiaDetalhesPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: NoticiaDetalhesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const noticia = await prisma.noticia.findUnique({
    where: { slug },
  });

  if (!noticia) {
    return { title: "Artigo Não Encontrado | Projeto Esperança Animal" };
  }

  return {
    title: `${noticia.titulo} | Blog Projeto Esperança Animal`,
    description: noticia.subtitulo || noticia.conteudo.substring(0, 150),
  };
}

export default async function NoticiaDetalhesPage({ params }: NoticiaDetalhesPageProps) {
  const { slug } = await params;

  const noticia = await prisma.noticia.findUnique({
    where: { slug },
  });

  if (!noticia || !noticia.publicado) {
    notFound();
  }

  const dataFormatada = new Date(noticia.createdAt).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const capaUrl =
    noticia.imagemCapaUrl ||
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200";

  // Divide o conteúdo em parágrafos separados
  const paragrafos = noticia.conteudo.split("\n").filter((p) => p.trim().length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <PublicHeader />

      <main className="flex-1 py-10 md:py-16">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Navegação de Volta */}
          <div>
            <Link
              href="/noticias"
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-emerald-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para todas as Notícias</span>
            </Link>
          </div>

          {/* Cabeçalho do Artigo */}
          <div className="space-y-4">
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {noticia.categoria}
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-950 tracking-tight leading-tight">
              {noticia.titulo}
            </h1>

            {noticia.subtitulo && (
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-medium">
                {noticia.subtitulo}
              </p>
            )}

            {/* Metadados do Autor e Data */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-neutral-200/80 text-xs text-neutral-500 font-medium">
              <span className="font-bold text-neutral-800">Por: {noticia.autorNome}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                {dataFormatada}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                {noticia.tempoLeituraMin} min de leitura
              </span>
            </div>
          </div>

          {/* Imagem de Capa em Alta Resolução */}
          <div className="rounded-3xl overflow-hidden border border-neutral-200 shadow-md bg-neutral-100 aspect-16/9 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capaUrl}
              alt={noticia.titulo}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Corpo do Texto */}
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-neutral-200/80 shadow-xs space-y-6 text-sm sm:text-base leading-relaxed text-neutral-800">
            {paragrafos.map((paragrafo, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragrafo}
              </p>
            ))}
          </div>

          {/* Banner de Chamada para Adoção / Apoio */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-black">
                Inspirado por essa história de superação?
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
                Mais de 50 cães e gatos resgatados estão esperando por uma família amorosa agora mesmo na nossa vitrine.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/animais"
                className="px-6 py-3 rounded-2xl bg-white text-emerald-800 hover:bg-neutral-100 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shrink-0"
              >
                <PawPrint className="w-4 h-4" />
                <span>Quero Adotar um Pet</span>
              </Link>
            </div>
          </div>
        </article>
      </main>

      <PublicFooter />
    </div>
  );
}
