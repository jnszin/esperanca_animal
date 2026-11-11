import { requireAuth } from "@/lib/auth-checks";
import { prisma } from "@/lib/prisma";
import { ListaCastracoesAdmin } from "@/components/lista-castracoes-admin";
import type { CastracaoAdminDTO } from "@/components/castracao-card-admin";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2, Clock, Syringe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardCastracoesPage() {
  await requireAuth();

  const registros = await prisma.solicitacaoCastracao.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      avaliadoPor: {
        select: { nome: true },
      },
    },
  });

  const items: CastracaoAdminDTO[] = registros.map((r) => ({
    id: r.id,
    protocolo: r.protocolo,
    nomeTutor: r.nomeTutor,
    whatsapp: r.whatsapp,
    endereco: r.endereco,
    bairro: r.bairro,
    municipio: r.municipio,
    nomePet: r.nomePet,
    especie: r.especie,
    raca: r.raca,
    sexo: r.sexo,
    pesoKg: Number(r.pesoKg),
    idadeEstimada: r.idadeEstimada,
    tipoServico: r.tipoServico,
    fotoPetUrl: r.fotoPetUrl,
    observacoesSaude: r.observacoesSaude,
    status: r.status,
    avisoStatus: r.avisoStatus,
    dataAgendamento: r.dataAgendamento ? r.dataAgendamento.toISOString() : null,
    localAtendimento: r.localAtendimento,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    avaliadoPorNome: r.avaliadoPor?.nome || null,
  }));

  const total = items.length;
  const novosOuAnalise = items.filter(
    (i) => i.status === "REGISTRADO" || i.status === "EM_ANALISE"
  ).length;
  const agendados = items.filter((i) => i.status === "AGENDADO").length;
  const realizados = items.filter((i) => i.status === "REALIZADO").length;

  return (
    <div className="min-h-screen bg-neutral-100/60 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Topo */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Dashboard</span>
          </Link>

          <Link
            href="/castracao"
            target="_blank"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            Visualizar Formulário Público ↗
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shrink-0">
              <Syringe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">
                Controle de Castração &amp; Vacinação
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Gerencie pedidos por município, atualize o protocolo e envie o aviso
                diretamente no WhatsApp do tutor.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="block text-lg font-black text-neutral-900">{total}</span>
              <span className="text-[11px] font-medium text-neutral-500">Total</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
              <span className="flex items-center justify-center gap-1 text-lg font-black text-amber-900">
                <Clock className="w-4 h-4" />
                {novosOuAnalise}
              </span>
              <span className="text-[11px] font-medium text-amber-700">Triagem</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-purple-50 border border-purple-200">
              <span className="flex items-center justify-center gap-1 text-lg font-black text-purple-900">
                <Calendar className="w-4 h-4" />
                {agendados}
              </span>
              <span className="text-[11px] font-medium text-purple-700">Agendados</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="flex items-center justify-center gap-1 text-lg font-black text-emerald-900">
                <CheckCircle2 className="w-4 h-4" />
                {realizados}
              </span>
              <span className="text-[11px] font-medium text-emerald-700">
                Realizados
              </span>
            </div>
          </div>
        </div>

        <ListaCastracoesAdmin items={items} />
      </div>
    </div>
  );
}

