import { requireAuth } from "@/lib/auth-checks";
import { prisma } from "@/lib/prisma";
import {
  PainelAjudasTabs,
  type AbaAdminAjudas,
} from "@/components/painel-ajudas-tabs";
import type { OfertaAjudaAdminDTO } from "@/components/ajuda-card-admin";
import type { VoluntarioAdminDTO } from "@/components/voluntario-card-admin";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  HandHeart,
  HeartHandshake,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface DashboardAjudasPageProps {
  searchParams: Promise<{ aba?: string }>;
}

export default async function DashboardAjudasPage({
  searchParams,
}: DashboardAjudasPageProps) {
  await requireAuth();

  const { aba } = await searchParams;
  const initialAba: AbaAdminAjudas =
    aba === "voluntarios" ? "voluntarios" : "ofertas";

  const [ofertasRaw, voluntariosRaw] = await Promise.all([
    prisma.ofertaAjuda.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.voluntarioInscricao.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const ofertas: OfertaAjudaAdminDTO[] = ofertasRaw.map((o) => ({
    id: o.id,
    protocolo: o.protocolo,
    nomeDoador: o.nomeDoador,
    whatsapp: o.whatsapp,
    municipio: o.municipio,
    bairro: o.bairro,
    tipoAjuda: o.tipoAjuda,
    formaEntrega: o.formaEntrega,
    mensagem: o.mensagem,
    status: o.status,
    observacaoEquipe: o.observacaoEquipe,
    createdAt: o.createdAt.toISOString(),
  }));

  const voluntarios: VoluntarioAdminDTO[] = voluntariosRaw.map((v) => ({
    id: v.id,
    protocolo: v.protocolo,
    nome: v.nome,
    whatsapp: v.whatsapp,
    municipio: v.municipio,
    disponibilidade: v.disponibilidade,
    modalidade: v.modalidade,
    descricao: v.descricao,
    status: v.status,
    observacaoEquipe: v.observacaoEquipe,
    createdAt: v.createdAt.toISOString(),
  }));

  const novasOfertas = ofertas.filter((i) => i.status === "NOVO").length;
  const novosVoluntarios = voluntarios.filter((v) => v.status === "NOVO").length;
  const voluntariosAtivos = voluntarios.filter((v) => v.status === "ATIVO").length;

  return (
    <div className="min-h-screen bg-neutral-100/60 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Dashboard</span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/ajude"
              target="_blank"
              className="text-emerald-700 hover:text-emerald-800 transition"
            >
              Aba Ajude ↗
            </Link>
            <Link
              href="/ajude?aba=voluntarios"
              target="_blank"
              className="text-emerald-700 hover:text-emerald-800 transition"
            >
              Área de Voluntários ↗
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">
                Ajude, Insumos &amp; Voluntários
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Gerencie ofertas de ração, itens e dinheiro, além dos cadastros de
                voluntários para passeios, lar temporário e apoios diversos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
              <span className="flex items-center justify-center gap-1 text-lg font-black text-amber-900">
                <Sparkles className="w-4 h-4" />
                {novasOfertas}
              </span>
              <span className="text-[11px] font-medium text-amber-700">
                Novas Ofertas
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200">
              <span className="flex items-center justify-center gap-1 text-lg font-black text-blue-900">
                <HandHeart className="w-4 h-4" />
                {novosVoluntarios}
              </span>
              <span className="text-[11px] font-medium text-blue-700">
                Novos Voluntários
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="flex items-center justify-center gap-1 text-lg font-black text-emerald-900">
                <CheckCircle2 className="w-4 h-4" />
                {voluntariosAtivos}
              </span>
              <span className="text-[11px] font-medium text-emerald-700">
                Volunt. Ativos
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="block text-lg font-black text-neutral-900">
                {ofertas.length + voluntarios.length}
              </span>
              <span className="text-[11px] font-medium text-neutral-500">
                Total Geral
              </span>
            </div>
          </div>
        </div>

        <PainelAjudasTabs
          ofertas={ofertas}
          voluntarios={voluntarios}
          novasOfertas={novasOfertas}
          novosVoluntarios={novosVoluntarios}
          initialAba={initialAba}
        />
      </div>
    </div>
  );
}
