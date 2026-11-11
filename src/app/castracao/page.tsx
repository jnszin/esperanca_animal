import type { Metadata } from "next";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { CastracaoPortal } from "@/components/castracao-portal";
import { consultarProtocoloCastracao } from "@/actions/castracao";
import { Bell, MapPin, ShieldCheck, Syringe } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Castração & Vacinação de Pets | Esperança Animal",
  description:
    "Cadastre seu pet para solicitação de castração ou vacinação e acompanhe o andamento do protocolo com avisos da nossa equipe.",
};

interface CastracaoPageProps {
  searchParams: Promise<{
    protocolo?: string;
  }>;
}

export default async function CastracaoPage({ searchParams }: CastracaoPageProps) {
  const { protocolo } = await searchParams;
  const codigoInicial = protocolo?.trim().toUpperCase() || "";

  let initialData = null;
  let initialError: string | null = null;

  if (codigoInicial) {
    const res = await consultarProtocoloCastracao(codigoInicial);
    if (res.success && res.dados) {
      initialData = res.dados;
    } else {
      initialError = res.error || null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <PublicHeader />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide">
              <Syringe className="w-3.5 h-3.5 text-emerald-700" />
              <span>Programa de Controle Populacional &amp; Saúde</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-950 tracking-tight">
              Cadastro para Castração &amp; Vacinação
            </h1>

            <p className="text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Preencha os dados do tutor, do pet e do seu município. Você receberá na
              hora a confirmação de registro e um protocolo para acompanhar cada
              atualização da equipe.
            </p>
          </div>

          {/* Orientações Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-900">
                  Registro Imediato
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                  Assim que enviar o cadastro, o caso entra direto na fila da equipe com
                  protocolo único.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-900">
                  Organização por Município
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                  Informe corretamente endereço e município para direcionamento aos
                  mutirões locais.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-900">
                  Aviso no WhatsApp
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                  Consulte seu status no site ou receba os avisos da equipe direto no seu
                  WhatsApp.
                </p>
              </div>
            </div>
          </div>

          <CastracaoPortal
            initialProtocoloCode={codigoInicial}
            initialProtocoloData={initialData}
            initialProtocoloError={initialError}
          />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

