import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { LiveRevalidator } from "@/components/live-revalidator";
import Link from "next/link";
import { Newspaper, Clock, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog & Notícias | Esperança Animal",
  description: "Acompanhe os projetos concluídos, histórias emocionantes de resgates e dicas de cuidados veterinários da ONG Esperança Animal.",
};

interface NoticiasPageProps {
  searchParams: Promise<{
    categoria?: string;
  }>;
}

export default async function NoticiasPage({ searchParams }: NoticiasPageProps) {
  const { categoria } = await searchParams;

  const where = {
    publicado: true,
    ...(categoria && categoria !== "TODAS" ? { categoria } : {}),
  };

  const noticias = await prisma.noticia.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const categoriasDisponiveis = [
    "TODAS",
    "Projetos Concluídos",
    "Histórias de Resgate",
    "Dicas Veterinárias",
    "Eventos & Feiras",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <LiveRevalidator intervalMs={45000} />
      <PublicHeader />

      <main className="flex-1 pb-24">
        {/* ========================================================
            1. BANNER DO BLOG (Inspirado no visual de referência)
        ======================================================== */}
        <section className="bg-[#e8d5be] py-16 md:py-20 border-b border-amber-200/60 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
            <span className="text-xs uppercase tracking-widest font-black text-amber-900/80 mb-2 block">
              Esperança Animal em Ação
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white tracking-tight drop-shadow-xs font-bold">
              Nosso Blog
            </h1>
            <p className="text-lg sm:text-xl font-medium text-amber-950/80 mt-2">
              Dicas, Resgates & Notícias
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
          {/* ========================================================
              2. FILTROS POR CATEGORIA
          ======================================================== */}
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            {categoriasDisponiveis.map((cat) => {
              const isSelected = (!categoria && cat === "TODAS") || categoria === cat;
              return (
                <Link
                  key={cat}
                  href={cat === "TODAS" ? "/noticias" : `/noticias?categoria=${encodeURIComponent(cat)}`}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80"
                  }`}
                >
                  {cat === "TODAS" ? "Todas as Matérias" : cat}
                </Link>
              );
            })}
          </div>

          {/* ========================================================
              3. LISTAGEM DOS ARTIGOS (Cards Estilo Editorial)
          ======================================================== */}
          {noticias.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-neutral-200/80 text-center space-y-3">
              <div className="w-14 h-14 bg-neutral-100 text-neutral-400 rounded-2xl mx-auto flex items-center justify-center">
                <Newspaper className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-neutral-800">
                Nenhuma publicação encontrada nesta categoria
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Em breve nossa equipe publicará novos projetos e relatos de resgate.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {noticias.map((item) => {
                const dataFormatada = new Date(item.createdAt).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                const capaUrl =
                  item.imagemCapaUrl ||
                  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200";

                return (
                  <article
                    key={item.id}
                    className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col md:flex-row items-stretch"
                  >
                    {/* Imagem de Capa à Esquerda */}
                    <div className="relative md:w-80 h-56 md:h-auto shrink-0 overflow-hidden bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={capaUrl}
                        alt={item.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-neutral-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs border border-neutral-200/60">
                        {item.categoria}
                      </span>
                    </div>

                    {/* Conteúdo à Direita */}
                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Linha de Metadados: Data + Tempo de Leitura */}
                        <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium mb-2">
                          <span>{dataFormatada}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {item.tempoLeituraMin} min de leitura
                          </span>
                        </div>

                        {/* Título */}
                        <Link href={`/noticias/${item.slug}`}>
                          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-neutral-900 group-hover:text-emerald-700 transition leading-snug">
                            {item.titulo}
                          </h2>
                        </Link>

                        {/* Subtítulo / Resumo */}
                        {item.subtitulo && (
                          <p className="text-xs sm:text-sm text-neutral-600 line-clamp-3 leading-relaxed mt-2.5">
                            {item.subtitulo}
                          </p>
                        )}
                      </div>

                      {/* Rodapé do Card */}
                      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                        <span className="text-neutral-500 font-semibold">
                          Por: {item.autorNome}
                        </span>

                        <Link
                          href={`/noticias/${item.slug}`}
                          className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 transition group-hover:translate-x-1 duration-200"
                        >
                          <span>Ler Matéria Completa</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
