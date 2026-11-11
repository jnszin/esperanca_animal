import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { LiveRevalidator } from "@/components/live-revalidator";
import { Especie, Porte, Sexo, StatusAnimal, Prisma } from "@prisma/client";
import {
  FAIXAS_ETARIAS_LISTA,
  FAIXAS_ETARIAS_MAP,
  formatarEspecieBadge,
  formatarIdadeAproximada,
  formatarPorteAnimal,
  isFaixaEtariaValida,
  montarUrlFiltroAnimais,
  obterFaixaEtariaAnimal,
} from "@/lib/animal-labels";
import {
  PawPrint,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Info,
  RotateCcw,
} from "lucide-react";

interface AnimaisPageProps {
  searchParams: Promise<{
    especie?: string;
    faixa?: string;
    porte?: string;
    sexo?: string;
  }>;
}

const OPCOES_PORTE: { id: Porte; label: string }[] = [
  { id: Porte.PEQUENO, label: "Porte Pequeno" },
  { id: Porte.MEDIO, label: "Porte Médio" },
  { id: Porte.GRANDE, label: "Porte Grande" },
];

export default async function AnimaisPage({ searchParams }: AnimaisPageProps) {
  const params = await searchParams;

  const especieAtiva =
    params.especie && Object.values(Especie).includes(params.especie as Especie)
      ? (params.especie as Especie)
      : undefined;
  const faixaAtiva = isFaixaEtariaValida(params.faixa) ? params.faixa : undefined;
  const porteAtivo =
    params.porte && Object.values(Porte).includes(params.porte as Porte)
      ? (params.porte as Porte)
      : undefined;
  const sexoAtivo =
    params.sexo && Object.values(Sexo).includes(params.sexo as Sexo)
      ? (params.sexo as Sexo)
      : undefined;

  // Montagem dinâmica dos filtros combinados para consulta no Postgres
  const where: Prisma.AnimalWhereInput = {
    status: StatusAnimal.DISPONIVEL,
    ativo: true,
  };

  if (especieAtiva) where.especie = especieAtiva;
  if (faixaAtiva) where.idadeEstimadaMeses = FAIXAS_ETARIAS_MAP[faixaAtiva].whereMeses;
  if (porteAtivo) where.porte = porteAtivo;
  if (sexoAtivo) where.sexo = sexoAtivo;

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

  const temFiltroAtivo = Boolean(especieAtiva || faixaAtiva || porteAtivo || sexoAtivo);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <LiveRevalidator intervalMs={45000} />
      <PublicHeader />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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
                Filtre por idade ou porte para encontrar seu novo companheiro e veja a ficha completa de cada animal.
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="text-3xl font-black text-emerald-600 block">
                {animais.length}
              </span>
              <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                {animais.length === 1 ? "Pet disponível" : "Pets disponíveis"}
              </span>
            </div>
          </div>

          {/* Barra de Filtros Combinados (Espécie + Faixa Etária + Porte) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span>Filtrar animais disponíveis</span>
              </div>

              {temFiltroAtivo && (
                <Link
                  href="/animais"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar todos os filtros</span>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Filtro 1: Faixa Etária (Filhotes / Adultos / Idosos) */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Faixa Etária
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Link
                    href={montarUrlFiltroAnimais({
                      especie: especieAtiva,
                      porte: porteAtivo,
                    })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      !faixaAtiva
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    Todas
                  </Link>
                  {FAIXAS_ETARIAS_LISTA.map((item) => {
                    const ativo = faixaAtiva === item.id;
                    return (
                      <Link
                        key={item.id}
                        href={montarUrlFiltroAnimais({
                          especie: especieAtiva,
                          faixa: ativo ? undefined : item.id,
                          porte: porteAtivo,
                        })}
                        title={item.descricao}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          ativo
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Filtro 2: Porte */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Porte
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Link
                    href={montarUrlFiltroAnimais({
                      especie: especieAtiva,
                      faixa: faixaAtiva,
                    })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      !porteAtivo
                        ? "bg-neutral-900 text-white shadow-xs"
                        : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    Todos
                  </Link>
                  {OPCOES_PORTE.map((item) => {
                    const ativo = porteAtivo === item.id;
                    return (
                      <Link
                        key={item.id}
                        href={montarUrlFiltroAnimais({
                          especie: especieAtiva,
                          faixa: faixaAtiva,
                          porte: ativo ? undefined : item.id,
                        })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          ativo
                            ? "bg-neutral-900 text-white shadow-xs"
                            : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Filtro 3: Espécie */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Espécie
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Link
                    href={montarUrlFiltroAnimais({
                      faixa: faixaAtiva,
                      porte: porteAtivo,
                    })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      !especieAtiva
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    Todas
                  </Link>
                  <Link
                    href={montarUrlFiltroAnimais({
                      especie: especieAtiva === Especie.CACHORRO ? undefined : Especie.CACHORRO,
                      faixa: faixaAtiva,
                      porte: porteAtivo,
                    })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      especieAtiva === Especie.CACHORRO
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    🐶 Cães
                  </Link>
                  <Link
                    href={montarUrlFiltroAnimais({
                      especie: especieAtiva === Especie.GATO ? undefined : Especie.GATO,
                      faixa: faixaAtiva,
                      porte: porteAtivo,
                    })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      especieAtiva === Especie.GATO
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    🐱 Gatos
                  </Link>
                </div>
              </div>
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
                Não encontramos animais disponíveis com essa combinação de filtros. Limpe os
                filtros para visualizar todos os pets aguardando adoção.
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
                const faixa = obterFaixaEtariaAnimal(animal.idadeEstimadaMeses);
                const idadeTexto = formatarIdadeAproximada(animal.idadeEstimadaMeses);

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
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-neutral-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                        {formatarEspecieBadge(animal.especie)} •{" "}
                        {formatarPorteAnimal(animal.porte)}
                      </div>

                      {animal.exigeTelaProtecao && (
                        <div className="absolute top-3 right-3 bg-amber-500/95 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Exige Telas</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h2 className="text-lg font-bold text-neutral-950 truncate">
                            {animal.nome}
                          </h2>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${faixa.badgeClass}`}
                          >
                            {faixa.labelSingular}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-600 font-medium mb-3">
                          {animal.sexo === "MACHO" ? "Macho" : "Fêmea"} • ~{idadeTexto} •{" "}
                          {animal.raca}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {animal.temperamento.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-medium"
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
                            {animal.castrado ? "Castrado" : "Castração pendente"}
                          </span>
                          <span>{animal.vacinado ? "Vacinado" : "Vacinação pendente"}</span>
                        </div>

                        <Link
                          href={`/animais/${animal.slug}`}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-xs shadow-xs transition duration-200 block"
                        >
                          Ver Ficha &amp; Adotar
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
