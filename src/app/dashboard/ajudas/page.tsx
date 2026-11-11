import { requireAuth } from "@/lib/auth-checks";
import { prisma } from "@/lib/prisma";
import { ListaAjudasAdmin } from "@/components/lista-ajudas-admin";
import type { OfertaAjudaAdminDTO } from "@/components/ajuda-card-admin";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  HeartHandshake,
  MessageCircle,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardAjudasPage() {
  await requireAuth();

  const ofertas = await prisma.ofertaAjuda.findMany({
    orderBy: { createdAt: "desc" },
  });

  const items: OfertaAjudaAdminDTO[] = ofertas.map((o) => ({
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

  const total = items.length;
  const novas = items.filter((i) => i.status === "NOVO").length;
  const emContato = items.filter((i) => i.status === "EM_CONTATO").length;
  const recebidas = items.filter(
    (i) => i.status === "RECEBIDO_AGRADECIDO"
  ).length;

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

          <Link
            href="/ajude"
            target="_blank"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            Visualizar Aba Ajude Pública ↗
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">
                Ofertas de Ajuda &amp; Doações de Insumos
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Acompanhe quem ofereceu ração, shampoos, medicamentos ou apoio
                financeiro e responda pelo WhatsApp.
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
                <Sparkles className="w-4 h-4" />
                {novas}
              </span>
              <span className="text-[11px] font-medium text-amber-700">Novas</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200">
              <span className="flex items-center justify-center gap-1 text-lg font-black text-blue-900">
                <MessageCircle className="w-4 h-4" />
                {emContato}
              </span>
              <span className="text-[11px] font-medium text-blue-700">
                Em Contato
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="flex items-center justify-center gap-1 text-lg font-black text-emerald-900">
                <CheckCircle2 className="w-4 h-4" />
                {recebidas}
              </span>
              <span className="text-[11px] font-medium text-emerald-700">
                Recebidas
              </span>
            </div>
          </div>
        </div>

        <ListaAjudasAdmin items={items} />
      </div>
    </div>
  );
}

