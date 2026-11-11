import type { Metadata } from "next";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { AjudePortal, type AbaAjudePortal } from "@/components/ajude-portal";
import { HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Ajude o Projeto | Doações, Insumos & Voluntários | Projeto Esperança Animal",
  description:
    "Apoie o Projeto Esperança Animal com doações financeiras, ração, shampoos e medicamentos, ou cadastre-se como voluntário para passeios, lar temporário e apoio.",
};

interface AjudePageProps {
  searchParams: Promise<{ aba?: string }>;
}

export default async function AjudePage({ searchParams }: AjudePageProps) {
  const { aba } = await searchParams;
  const initialAba: AbaAjudePortal =
    aba === "voluntarios" ? "voluntarios" : "doacoes";

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <PublicHeader />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wide">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-700" />
              <span>Central de Solidariedade &amp; Voluntariado</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-950 tracking-tight">
              Ajude a Transformar Vidas
            </h1>

            <p className="text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Você pode apoiar financeiramente, oferecer ração, shampoos e
              medicamentos, ou se cadastrar como voluntário para passeios, lar
              temporário e ações do projeto.
            </p>
          </div>

          <AjudePortal initialAba={initialAba} />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
