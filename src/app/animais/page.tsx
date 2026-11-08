import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { LiveRevalidator } from "@/components/live-revalidator";
import { Especie, Porte, Sexo, StatusAnimal, Prisma } from "@prisma/client";
import {
  PawPrint,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Info,
} from "lucide-react";

interface AnimaisPageProps {
  searchParams: Promise<{
    especie?: string;
    porte?: string;
    sexo?: string;
  }>;
}

export default async function AnimaisPage({ searchParams }: AnimaisPageProps) {
  const params = await searchParams;

  // Montagem dinâmica dos filtros para consulta otimizada no Postgres
  const where: Prisma.AnimalWhereInput = {
    status: StatusAnimal.DISPONIVEL,
    ativo: true,
  };

  if (params.especie && Object.values(Especie).includes(params.especie as Especie)) {
    where.especie = params.especie as Especie;
  }

  if (params.porte && Object.values(Porte).includes(params.porte as Porte)) {
    where.porte = params.porte as Porte;
  }

  if (params.sexo && Object.values(Sexo).includes(params.sexo as Sexo)) {
    where.sexo = params.sexo as Sexo;
  }

  // Busca indexada no Postgres (usando @@index([status, especie, porte]))
  const animais = await prisma.animal.findMany({
    where,
    include: {
      fotos: {
        orderBy: [{ principal: "desc" }, { ordem: "asc" }],
        take: 1,
      },
    },
    orderBy: [{ destaqueVitrine: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <LiveRevalidator intervalMs={45000} />
      <PublicHeader />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Cabeçalho da Vitrine */}
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
                <PawPrint className="w-3.5 h-3.5" />
                <span>Vitrine de Adoção Responsável</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
                Animais Disponíveis para Adoção
              </h1>
              <p className="text-sm text-neutral-500 mt-2">
                Todos os nossos animais são entregues castrados, vacinados e
                vermifugados.
              </p>
            </div>

            <div className="text-right hidden md:block">
              <span className="text-3xl font-black text-emerald-600 block">
                {animais.length}
              </span>
              <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                Pets prontos para um lar
              </span>
            </div>
          </div>

          {/* Filtros Rápidos (RSC via URL SearchParams) */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 mr-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Filtrar por:</span>
            </div>

            {/* Filtro Espécie */}
            <div className="flex items-center gap-1.5">
              <Link
                href="/animais"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  !params.especie
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                }`}
              >
                Todos
              </Link>
              <Link
                href={`/animais?especie=CACHORRO${params.porte ? `&porte=${params.porte}` : ""}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  params.especie === "CACHORRO"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                }`}
              >
                🐶 Cães
              </Link>
              <Link
                href={`/animais?especie=GATO${params.porte ? `&porte=${params.porte}` : ""}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  params.especie === "GATO"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                }`}
              >
                🐱 Gatos
              </Link>
            </div>

            <div className="h-6 w-px bg-neutral-200 hidden sm:block" />

            {/* Filtro Porte */}
            <div className="flex items-center gap-1.5">
              <Link
                href={`/animais?${params.especie ? `especie=${params.especie}&` : ""}porte=PEQUENO`}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  params.porte === "PEQUENO"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                }`}
              >
                Porte Pequeno
              </Link>
              <Link
                href={`/animais?${params.especie ? `especie=${params.especie}&` : ""}porte=MEDIO`}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  params.porte === "MEDIO"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                }`}
              >
                Médio
              </Link>
              <Link
                href={`/animais?${params.especie ? `especie=${params.especie}&` : ""}porte=GRANDE`}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  params.porte === "GRANDE"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                }`}
              >
                Grande
              </Link>
            </div>
          </div>

          {/* Grid de Animais */}
          {animais.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto">
                <Info className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Nenhum pet encontrado</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Não encontramos animais disponíveis com os filtros selecionados. Tente
                limpar os filtros para ver todos os amigos disponíveis.
              </p>
              <Link
                href="/animais"
                className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
              >
                Limpar Filtros
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {animais.map((animal) => {
                const fotoUrl =
                  animal.fotos[0]?.url ||
                  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800";

                return (
                  <div
                    key={animal.id}
                    className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={fotoUrl}
                        alt={animal.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-neutral-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                        {animal.especie === "CACHORRO" ? "🐶 Cão" : "🐱 Gato"} •{" "}
                        {animal.porte}
                      </div>

                      {animal.exigeTelaProtecao && (
                        <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Exige Telas</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h2 className="text-lg font-bold text-neutral-950">
                            {animal.nome}
                          </h2>
                          <span className="text-xs text-neutral-500 font-medium">
                            {animal.sexo === "MACHO" ? "Macho" : "Fêmea"}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-500 font-medium mb-3">
                          {animal.raca} • {Math.floor(animal.idadeEstimadaMeses / 12)} anos
                        </p>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {animal.temperamento.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 text-[10px] font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-neutral-100">
                        <div className="flex items-center justify-between text-[11px] text-neutral-500">
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {animal.castrado ? "Castrado" : "Pendente"}
                          </span>
                          <span>{animal.vacinado ? "Vacinado" : ""}</span>
                        </div>

                        <Link
                          href={`/animais/${animal.slug}`}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-xs shadow-xs transition duration-200 block"
                        >
                          Conhecer & Adotar
                        </Link>
                      </div>
                    </div>
                  </div>
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
