import { requireAuth } from "@/lib/auth-checks";
import { logoutAction } from "@/actions/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  PawPrint,
  LogOut,
  Users,
  HeartHandshake,
  ShieldAlert,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  Heart,
  Globe,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuth();

  // Busca contadores de atividades em tempo real na VPS
  const chamadosPendentes = await prisma.chamadoAcolhimento.count({
    where: { status: "PENDENTE_ANALISE" },
  });

  const totalAnimais = await prisma.animal.count({
    where: { ativo: true },
  });

  const adocoesRecebidas = await prisma.solicitacaoAdocao.count({
    where: { status: "RECEBIDO" },
  });

  return (
    <div className="min-h-screen bg-neutral-100/60 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header do Backoffice */}
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold">
              <PawPrint className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900">
                  Olá, {user.nome}!
                </h1>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                    user.cargo === "ADMIN"
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}
                >
                  {user.cargo}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {user.email} • Patas em Dia / Esperança Animal
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
            >
              <Globe className="w-4 h-4" />
              <span>Ver Site Público</span>
            </Link>

            {user.cargo === "ADMIN" && (
              <Link
                href="/dashboard/usuarios"
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition"
              >
                <Users className="w-4 h-4" />
                <span>Gestão de Voluntários</span>
              </Link>
            )}

            <form action={logoutAction}>
              <button
                type="submit"
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition border border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </form>
          </div>
        </header>

        {/* ========================================================
            MÓDULOS OPERACIONAIS DA ONG
        ======================================================== */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Módulos Operacionais & Atendimento
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card: Central de Chamados de Resgate */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200/80 flex flex-col justify-between hover:shadow-md transition group relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  {chamadosPendentes > 0 ? (
                    <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-bold animate-pulse">
                      {chamadosPendentes} pendente(s)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-semibold">
                      Sem pendências
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-red-600 transition">
                    Plantão de Chamados & Resgate
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Atendimento de ocorrências comunitárias, relatos de risco, análise
                    de fotos no R2 e despacho de resgate.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/dashboard/chamados"
                  className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <span>Acessar Plantão de Resgate</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card: Vitrine de Animais */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200/80 flex flex-col justify-between hover:shadow-md transition group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <PawPrint className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                    {totalAnimais} ativos
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-emerald-700 transition">
                    Catálogo de Animais
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Gerenciamento dos pets cadastrados na vitrine pública para adoção,
                    históricos médicos e status.
                  </p>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <Link
                  href="/dashboard/animais"
                  className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <span>Gerenciar Animais</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center justify-between px-1 text-[11px]">
                  <Link
                    href="/dashboard/animais/novo"
                    className="font-semibold text-emerald-600 hover:underline"
                  >
                    + Novo Pet
                  </Link>
                  <Link
                    href="/animais"
                    target="_blank"
                    className="text-neutral-400 hover:text-neutral-700"
                  >
                    Vitrine pública ↗
                  </Link>
                </div>
              </div>
            </div>

            {/* Card: Solicitações de Adoção */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200/80 flex flex-col justify-between hover:shadow-md transition group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Heart className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                    {adocoesRecebidas} recebidas
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-blue-700 transition">
                    Triagem de Adoção
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Formulário inteligente com cálculo automático de compatibilidade e
                    notificações integradas ao WhatsApp via n8n.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/dashboard/adocoes"
                  className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <span>Ver Painel de Adoções</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo de Segurança e Defesa em Profundidade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-neutral-200/60">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Edge Middleware</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Sessão JWT validada em memória na borda sem queries ao PostgreSQL.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Defesa em Profundidade</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Server Actions checam cargo antes de qualquer transação com o Prisma.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Segurança RBAC</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Segregação estrita de privilégios entre VOLUNTARIO e ADMIN.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
