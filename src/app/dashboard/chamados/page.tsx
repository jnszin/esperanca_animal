import { requireAuth } from "@/lib/auth-checks";
import { prisma } from "@/lib/prisma";
import { ChamadoCardAdmin } from "@/components/chamado-card-admin";
import Link from "next/link";
import { ArrowLeft, PhoneCall, AlertTriangle, ShieldCheck } from "lucide-react";

export default async function DashboardChamadosPage() {
  await requireAuth();

  const chamados = await prisma.chamadoAcolhimento.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      atendidoPor: {
        select: {
          nome: true,
          email: true,
        },
      },
    },
  });

  const total = chamados.length;
  const pendentes = chamados.filter((c) => c.status === "PENDENTE_ANALISE").length;
  const emDeslocamento = chamados.filter((c) => c.status === "EM_DESLOCAMENTO").length;
  const resgatados = chamados.filter((c) => c.status === "RESGATADO").length;
  const criticos = chamados.filter(
    (c) => c.nivelUrgencia === "CRITICA" && c.status === "PENDENTE_ANALISE"
  ).length;

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
            href="/chamados"
            target="_blank"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            Visualizar Formulário Público ↗
          </Link>
        </div>

        {/* Header do Módulo */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center font-bold">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">
                Plantão de Chamados de Acolhimento
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Central operacional de triagem de resgates e atendimento comunitário
              </p>
            </div>
          </div>
        </div>

        {/* Cards de Métricas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-xs font-semibold text-neutral-500 block">Total Recebido</span>
            <span className="text-2xl font-black text-neutral-900 mt-1 block">{total}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-xs font-semibold text-amber-700 block">Pendentes Análise</span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">{pendentes}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-xs font-semibold text-blue-700 block">Em Deslocamento</span>
            <span className="text-2xl font-black text-blue-700 mt-1 block">{emDeslocamento}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <span className="text-xs font-semibold text-emerald-700 block">Resgatados</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{resgatados}</span>
          </div>
        </div>

        {/* Alerta de Casos Críticos Pendentes */}
        {criticos > 0 && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600 animate-pulse" />
            <span>
              <strong>Atenção:</strong> Há <strong>{criticos}</strong> chamado(s) de urgência
              CRÍTICA pendente(s) aguardando atendimento imediato da equipe!
            </span>
          </div>
        )}

        {/* Lista de Chamados */}
        {chamados.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-neutral-200/80 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-neutral-800">
              Nenhum chamado de resgate registrado no momento
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Quando a população registrar pedidos de resgate no portal público, eles
              aparecerão aqui em tempo real.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chamados.map((c) => (
              <ChamadoCardAdmin
                key={c.id}
                chamado={{
                  ...c,
                  latitude: c.latitude ? Number(c.latitude) : null,
                  longitude: c.longitude ? Number(c.longitude) : null,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
