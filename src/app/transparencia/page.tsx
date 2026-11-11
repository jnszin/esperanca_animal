import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { LiveRevalidator } from "@/components/live-revalidator";
import type { Metadata } from "next";
import {
  BarChart3,
  Heart,
  PawPrint,
  ShieldCheck,
  PhoneCall,
  MapPin,
  Sparkles,
  ArrowRight,
  Newspaper,
  Calendar,
  Clock,
  Info,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transparência & Impacto | Esperança Animal",
  description:
    "Acompanhe em tempo real os resultados de acolhimento, saúde preventiva, adoções e resgates comunitários da ONG Esperança Animal.",
};

function calcularPercentual(parte: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((parte / total) * 100);
}

function traduzirEspecie(especie: string): string {
  if (especie === "CACHORRO") return "Cachorro";
  if (especie === "GATO") return "Gato";
  return "Outro";
}

function traduzirPorte(porte: string): string {
  if (porte === "PEQUENO") return "Porte Pequeno";
  if (porte === "MEDIO") return "Porte Médio";
  return "Porte Grande";
}

export default async function TransparenciaPage() {
  const [animais, chamados, adocoes, noticiasRecentes] = await Promise.all([
    prisma.animal.findMany({
      where: {
        OR: [{ ativo: true }, { status: "ADOTADO" }],
      },
      select: {
        id: true,
        nome: true,
        slug: true,
        especie: true,
        porte: true,
        raca: true,
        castrado: true,
        vacinado: true,
        vermifugado: true,
        status: true,
        updatedAt: true,
        fotos: {
          orderBy: [{ principal: "desc" }, { ordem: "asc" }],
          take: 1,
          select: { url: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.chamadoAcolhimento.findMany({
      select: {
        status: true,
        bairro: true,
        cidade: true,
      },
    }),
    prisma.solicitacaoAdocao.findMany({
      select: {
        status: true,
        scoreTriagem: true,
      },
    }),
    prisma.noticia.findMany({
      where: { publicado: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        titulo: true,
        slug: true,
        subtitulo: true,
        imagemCapaUrl: true,
        categoria: true,
        tempoLeituraMin: true,
        createdAt: true,
      },
    }),
  ]);

  const totalAnimais = animais.length;
  const adotadosLista = animais.filter((a) => a.status === "ADOTADO");
  const totalAdotados = adotadosLista.length;
  const totalDisponiveis = animais.filter((a) => a.status === "DISPONIVEL").length;
  const totalEmProcesso = animais.filter((a) => a.status === "EM_PROCESSO").length;
  const totalEmTratamento = animais.filter((a) => a.status === "EM_TRATAMENTO").length;

  const pctCastrados = calcularPercentual(
    animais.filter((a) => a.castrado).length,
    totalAnimais
  );
  const pctVacinados = calcularPercentual(
    animais.filter((a) => a.vacinado).length,
    totalAnimais
  );
  const pctVermifugados = calcularPercentual(
    animais.filter((a) => a.vermifugado).length,
    totalAnimais
  );

  const totalCachorros = animais.filter((a) => a.especie === "CACHORRO").length;
  const totalGatos = animais.filter((a) => a.especie === "GATO").length;
  const totalOutros = animais.filter((a) => a.especie === "OUTRO").length;

  const totalChamados = chamados.length;
  const chamadosResgatados = chamados.filter((c) => c.status === "RESGATADO").length;
  const chamadosEmAtendimento = chamados.filter(
    (c) => c.status === "PENDENTE_ANALISE" || c.status === "EM_DESLOCAMENTO"
  ).length;
  const chamadosEncaminhados = chamados.filter(
    (c) => c.status === "ENCAMINHADO_TERCEIROS"
  ).length;

  const bairrosContagem = new Map<string, number>();
  for (const chamado of chamados) {
    const bairroLimpo = chamado.bairro?.trim();
    const cidadeLimpa = chamado.cidade?.trim();
    if (!bairroLimpo) continue;
    const chave = cidadeLimpa ? `${bairroLimpo} — ${cidadeLimpa}` : bairroLimpo;
    bairrosContagem.set(chave, (bairrosContagem.get(chave) || 0) + 1);
  }
  const topBairros = Array.from(bairrosContagem.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalSolicitacoes = adocoes.length;
  const mediaMatch =
    totalSolicitacoes > 0
      ? Math.round(
          adocoes.reduce((acc, s) => acc + s.scoreTriagem, 0) / totalSolicitacoes
        )
      : 0;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <PublicHeader />
      <LiveRevalidator />

      <main className="flex-1">
        {/* Hero da Transparência */}
        <section className="bg-linear-to-br from-emerald-950 via-emerald-900 to-neutral-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dados Operacionais em Tempo Real</span>
            </div>

            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
                Portal de Transparência &amp; Impacto
              </h1>
              <p className="text-emerald-100/85 text-sm sm:text-base leading-relaxed">
                Cada número nesta página é calculado diretamente a partir dos registros
                de resgate, cuidados veterinários preventivos e adoções responsáveis
                gerenciados pela Esperança Animal.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/animais"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-950/40"
              >
                <PawPrint className="w-4 h-4" />
                <span>Ver Vitrine de Adoção</span>
              </Link>
              <Link
                href="/noticias"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 border border-white/15 transition"
              >
                <Newspaper className="w-4 h-4" />
                <span>Projetos no Blog</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Cards Principais de Impacto */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-md space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <PawPrint className="w-5 h-5" />
              </div>
              <div>
                <p className="text-3xl font-black text-neutral-900">{totalAnimais}</p>
                <p className="text-xs font-bold text-neutral-700 mt-0.5">
                  Vidas Assistidas na Plataforma
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  {totalDisponiveis} disponíveis para adoção agora
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-md space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-3xl font-black text-neutral-900">{totalAdotados}</p>
                <p className="text-xs font-bold text-neutral-700 mt-0.5">
                  Finais Felizes Concluídos
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  {totalEmProcesso} pet(s) em entrevista no momento
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-md space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-3xl font-black text-neutral-900">{pctVacinados}%</p>
                <p className="text-xs font-bold text-neutral-700 mt-0.5">
                  Cobertura Vacinal Preventiva
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  {pctCastrados}% castrados • {pctVermifugados}% vermifugados
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-md space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <p className="text-3xl font-black text-neutral-900">{chamadosResgatados}</p>
                <p className="text-xs font-bold text-neutral-700 mt-0.5">
                  Resgates Comunitários Realizados
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  De {totalChamados} chamado(s) • {mediaMatch}% match médio
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Distribuição & Indicadores Visuais */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bloco 1: Protocolos Sanitários e Perfil do Plantel */}
            <div className="bg-white rounded-3xl p-7 border border-neutral-200/80 shadow-xs space-y-7">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Cuidado Veterinário &amp; Perfil
                </span>
                <h2 className="text-xl font-extrabold text-neutral-900">
                  Saúde Preventiva &amp; Distribuição
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Vacinação em Dia", valor: pctVacinados, cor: "bg-emerald-600" },
                  { label: "Castração Realizada", valor: pctCastrados, cor: "bg-sky-600" },
                  { label: "Vermifugação", valor: pctVermifugados, cor: "bg-amber-500" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                      <span>{item.label}</span>
                      <span className="font-bold text-neutral-900">{item.valor}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.cor} transition-all`}
                        style={{ width: `${item.valor}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-5 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 text-center">
                  <span className="block text-lg font-black text-neutral-900">
                    {totalCachorros}
                  </span>
                  <span className="text-[11px] font-medium text-neutral-500">
                    Cachorros
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 text-center">
                  <span className="block text-lg font-black text-neutral-900">
                    {totalGatos}
                  </span>
                  <span className="text-[11px] font-medium text-neutral-500">Gatos</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 text-center">
                  <span className="block text-lg font-black text-neutral-900">
                    {totalOutros}
                  </span>
                  <span className="text-[11px] font-medium text-neutral-500">Outros</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                  <span className="block text-lg font-black text-amber-800">
                    {totalEmTratamento}
                  </span>
                  <span className="text-[11px] font-medium text-amber-700">
                    Em Recuperação
                  </span>
                </div>
              </div>
            </div>

            {/* Bloco 2: Atuação nos Bairros & Triagens */}
            <div className="bg-white rounded-3xl p-7 border border-neutral-200/80 shadow-xs space-y-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                  Mapeamento Comunitário
                </span>
                <h2 className="text-xl font-extrabold text-neutral-900">
                  Atendimento de Resgates &amp; Regiões
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <p className="text-xl font-black text-emerald-900">
                    {chamadosResgatados}
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-700">
                    Resgatados
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                  <p className="text-xl font-black text-amber-900">
                    {chamadosEmAtendimento}
                  </p>
                  <p className="text-[11px] font-semibold text-amber-700">
                    Em Fila / Rota
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200">
                  <p className="text-xl font-black text-neutral-900">
                    {chamadosEncaminhados}
                  </p>
                  <p className="text-[11px] font-semibold text-neutral-600">
                    Encaminhados
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>Bairros com Maior Demanda de Acolhimento</span>
                </h3>

                {topBairros.length > 0 ? (
                  <div className="space-y-2.5">
                    {topBairros.map(([local, count]) => (
                      <div
                        key={local}
                        className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs"
                      >
                        <span className="font-semibold text-neutral-800">{local}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white border border-neutral-200 font-bold text-neutral-700">
                          {count} {count === 1 ? "chamado" : "chamados"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-neutral-50 border border-dashed border-neutral-200 text-xs text-neutral-500 text-center">
                    Ainda não há ocorrências de resgate registradas por bairro.
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Total de questionários de adoção analisados:</span>
                <strong className="text-neutral-900 font-extrabold">
                  {totalSolicitacoes}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* Mural de Finais Felizes */}
        <section className="bg-white border-y border-neutral-200/70 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mural de Finais Felizes</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">
                  Vidas que ganharam um lar seguro
                </h2>
              </div>
              <Link
                href="/animais"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5"
              >
                <span>Ver animais esperando adoção</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {adotadosLista.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {adotadosLista.slice(0, 6).map((pet) => {
                  const fotoUrl = pet.fotos[0]?.url;
                  return (
                    <div
                      key={pet.id}
                      className="rounded-3xl border border-neutral-200/80 overflow-hidden bg-neutral-50/50 hover:shadow-md transition flex flex-col"
                    >
                      <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden">
                        {fotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={fotoUrl}
                            alt={pet.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <PawPrint className="w-10 h-10" />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-sm">
                          Adotado com Amor
                        </span>
                      </div>

                      <div className="p-5 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-extrabold text-neutral-900">
                            {pet.nome}
                          </h3>
                          <p className="text-xs text-neutral-500">
                            {traduzirEspecie(pet.especie)} • {traduzirPorte(pet.porte)}
                          </p>
                        </div>
                        <Heart className="w-5 h-5 text-emerald-600 fill-emerald-600 shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 rounded-3xl bg-neutral-50 border border-dashed border-neutral-200 text-center space-y-3">
                <Heart className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-neutral-900">
                  O primeiro final feliz na plataforma está prestes a acontecer!
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Assim que a primeira adoção for concluída, os registros aparecerão
                  automaticamente neste mural de celebração.
                </p>
                <div className="pt-1">
                  <Link
                    href="/animais"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                  >
                    <span>Conhecer Pets Disponíveis</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Últimos Projetos Publicados no Blog */}
        {noticiasRecentes.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Diário de Ações
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">
                  Últimos Projetos &amp; Histórias do Blog
                </h2>
              </div>
              <Link
                href="/noticias"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1.5"
              >
                <span>Ver todas as publicações</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {noticiasRecentes.map((post) => (
                <Link
                  key={post.id}
                  href={`/noticias/${post.slug}`}
                  className="bg-white rounded-3xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col"
                >
                  <div className="aspect-16/10 bg-neutral-100 overflow-hidden">
                    {post.imagemCapaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.imagemCapaUrl}
                        alt={post.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <Newspaper className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold">
                        {post.categoria}
                      </span>
                      <h3 className="text-base font-extrabold text-neutral-900 group-hover:text-emerald-700 transition line-clamp-2">
                        {post.titulo}
                      </h3>
                      {post.subtitulo && (
                        <p className="text-xs text-neutral-600 line-clamp-2">
                          {post.subtitulo}
                        </p>
                      )}
                    </div>
                    <div className="pt-2 flex items-center gap-3 text-[11px] text-neutral-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.tempoLeituraMin} min
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Nota Discreta sobre Relatórios Financeiros */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-2">
          <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs text-amber-950 leading-relaxed">
              <p className="font-extrabold text-sm">
                Sobre a Prestação de Contas Financeira
              </p>
              <p className="text-amber-900/90">
                Os demonstrativos de arrecadação e aplicação de doações serão integrados
                a este portal em conjunto com a ativação oficial do módulo de campanhas
                Pix na etapa final de alinhamento da ONG.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
