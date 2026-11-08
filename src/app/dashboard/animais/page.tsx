import { requireAuth } from "@/lib/auth-checks";
import { prisma } from "@/lib/prisma";
import { ListaAnimaisAdmin } from "@/components/lista-animais-admin";
import Link from "next/link";
import { ArrowLeft, PawPrint, Plus } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestão e Catálogo de Animais | Esperança Animal",
  description: "Painel de gestão, atualização clínica e vitrine de animais da ONG.",
};

export default async function DashboardAnimaisPage() {
  await requireAuth();

  const animaisRaw = await prisma.animal.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      fotos: {
        select: { url: true },
        orderBy: { principal: "desc" },
      },
    },
  });

  const animais = animaisRaw.map((animal) => ({
    ...animal,
    pesoKg: animal.pesoKg ? Number(animal.pesoKg) : null,
  }));

  // KPIs de Gestão
  const totalAtivos = animais.filter((a) => a.ativo).length;
  const disponiveis = animais.filter((a) => a.ativo && a.status === "DISPONIVEL").length;
  const emProcesso = animais.filter((a) => a.ativo && a.status === "EM_PROCESSO").length;
  const emTratamento = animais.filter((a) => a.ativo && a.status === "EM_TRATAMENTO").length;
  const arquivados = animais.filter((a) => !a.ativo).length;

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
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold">
              <PawPrint className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900">
                  Catálogo e Gestão de Animais
                </h1>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Fase 6 • Gestão Ativa
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Controle de acolhimento, status clínico, destaque na home e cadastro de novos pets
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/animais/novo"
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cadastrar Novo Pet</span>
          </Link>
        </div>

        {/* Cards de Métricas e KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-neutral-500 block">Pets Ativos</span>
            <span className="text-2xl font-black text-neutral-900 mt-1 block">{totalAtivos}</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-600 block">Disponíveis</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{disponiveis}</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-purple-600 block">Em Processo</span>
            <span className="text-2xl font-black text-purple-700 mt-1 block">{emProcesso}</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-600 block">Em Tratamento</span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">{emTratamento}</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-neutral-600 block">Fora da Vitrine</span>
            <span className="text-2xl font-black text-neutral-700 mt-1 block">{arquivados}</span>
          </div>
        </div>

        {/* Listagem Interativa de Animais */}
        <ListaAnimaisAdmin animais={animais} />
      </div>
    </div>
  );
}
