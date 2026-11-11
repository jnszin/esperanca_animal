import { requireAuth } from "@/lib/auth-checks";
import { prisma } from "@/lib/prisma";
import { ListaAdocoesAdmin } from "@/components/lista-adocoes-admin";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestão e Avaliação de Adoções | Projeto Esperança Animal",
  description: "Painel de triagem e avaliação de candidaturas de adoção responsável.",
};

export default async function DashboardAdocoesPage() {
  await requireAuth();

  const solicitacoesRaw = await prisma.solicitacaoAdocao.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      animal: {
        select: {
          id: true,
          nome: true,
          slug: true,
          especie: true,
          raca: true,
          porte: true,
          sexo: true,
          exigeTelaProtecao: true,
          fotos: {
            select: { url: true },
            take: 1,
          },
        },
      },
      avaliadoPor: {
        select: {
          nome: true,
          email: true,
        },
      },
    },
  });

  // KPIs
  const total = solicitacoesRaw.length;
  const pendentes = solicitacoesRaw.filter((s) => s.status === "RECEBIDO").length;
  const entrevistas = solicitacoesRaw.filter((s) => s.status === "ENTREVISTA_AGENDADA").length;
  const aprovadas = solicitacoesRaw.filter((s) => s.status === "APROVADO").length;
  const altaCompatibilidade = solicitacoesRaw.filter((s) => s.scoreTriagem >= 80).length;

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
            href="/animais"
            target="_blank"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            Ver Vitrine Pública de Adoção ↗
          </Link>
        </div>

        {/* Header do Módulo */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-bold">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900">
                  Painel de Avaliação de Adoções
                </h1>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Fase 5 • Triagem Ativa
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Avaliação de candidatos, análise algorítmica de moradia e agendamento de entrevistas
              </p>
            </div>
          </div>
        </div>

        {/* Cards de Métricas e KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-neutral-500 block">Total Recebidas</span>
            <span className="text-2xl font-black text-neutral-900 mt-1 block">{total}</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-700 block">Pendentes (Novas)</span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">{pendentes}</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-700 block">Score Alto (80+)</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{altaCompatibilidade}</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-purple-700 block">Entrevistas Marcadas</span>
            <span className="text-2xl font-black text-purple-700 mt-1 block">{entrevistas}</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-blue-700 block">Adoções Aprovadas</span>
            <span className="text-2xl font-black text-blue-700 mt-1 block">{aprovadas}</span>
          </div>
        </div>

        {/* Lista Interativa com Busca e Filtros */}
        <ListaAdocoesAdmin solicitacoes={solicitacoesRaw} />
      </div>
    </div>
  );
}
