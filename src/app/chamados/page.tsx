import { Metadata } from "next";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { FormChamado } from "@/components/form-chamado";
import { PhoneCall, AlertCircle, HeartHandshake, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Pedir Resgate de Emergência & Acolhimento | Esperança Animal",
  description:
    "Reporte animais abandonados, doentes ou em risco iminente de atropelamento e maus-tratos para a equipe de atendimento da Esperança Animal.",
};

export default function ChamadosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <PublicHeader />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header da Página */}
          <div className="text-center space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-bold tracking-wide">
              <PhoneCall className="w-3.5 h-3.5 text-red-600" />
              <span>Plantão de Resgate & Acolhimento Animal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-950 tracking-tight">
              Reportar Animal em Situação de Risco
            </h1>

            <p className="text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Viu um animal abandonado, ferido ou sofrendo maus-tratos? Preencha o chamado
              com localização e fotos. Nossa equipe analisa o nível de gravidade e
              dispara o protocolo para o seu WhatsApp.
            </p>
          </div>

          {/* Cards Rápidos de Orientação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Triagem por Gravidade</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                  Casos de risco iminente de vida (atropelamento/hemorragia) têm prioridade absoluta.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Poder do Lar Temporário</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                  Se você puder acolher temporariamente, nós custeamos veterinário e ração.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Protocolo no WhatsApp</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                  Você acompanha o chamado diretamente pelo WhatsApp com a chave de ocorrência.
                </p>
              </div>
            </div>
          </div>

          {/* Formulário Principal */}
          <FormChamado />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

