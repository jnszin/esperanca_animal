import { Metadata } from "next";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { FormChamado } from "@/components/form-chamado";
import { CANAIS_PREFEITURAS_RESGATE } from "@/lib/chamado-labels";
import {
  PhoneCall,
  Building2,
  AlertCircle,
  HeartHandshake,
  ShieldAlert,
  ArrowDown,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Resgates & Canais das Prefeituras | Projeto Esperança Animal",
  description:
    "Confira os canais oficiais das prefeituras da Grande Vitória para gerar protocolo de resgate e registre animais encontrados com foto e localização.",
};

export default function ChamadosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <PublicHeader />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          {/* Header da Página */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-bold tracking-wide">
              <PhoneCall className="w-3.5 h-3.5 text-red-600" />
              <span>Central de Resgates &amp; Acolhimento Animal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-950 tracking-tight">
              Encontrou um animal precisando de ajuda?
            </h1>

            <p className="text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Veja abaixo como abrir um protocolo oficial na prefeitura da sua
              cidade e, em seguida, registre a ocorrência no nosso formulário para
              acompanhamento da equipe.
            </p>
          </div>

          {/* ========================================================
              PARTE 1: CANAIS OFICIAIS DAS PREFEITURAS (GRANDE VITÓRIA)
          ======================================================== */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200/80 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 block">
                    Passo 1 • Guia das Prefeituras
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900">
                    Onde ligar e gerar protocolo no seu município
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                    Cada prefeitura possui regras próprias para recolhimento de
                    cães/gatos e animais de grande porte. Anote o{" "}
                    <strong>número de protocolo</strong> gerado para informar no
                    formulário abaixo.
                  </p>
                </div>
              </div>

              <a
                href="#formulario-resgate"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition shrink-0"
              >
                <span>Ir para o Formulário</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CANAIS_PREFEITURAS_RESGATE.map((canal) => (
                <div
                  key={canal.municipio}
                  className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-black text-neutral-900">
                        {canal.municipio}
                      </h3>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${canal.badgeClass}`}
                      >
                        Canal Municipal
                      </span>
                    </div>

                    <p className="text-xs font-extrabold text-neutral-900 bg-white px-3 py-2 rounded-xl border border-neutral-200">
                      {canal.canalPrincipal}
                    </p>

                    <div className="space-y-1.5 text-xs text-neutral-700 leading-relaxed">
                      <p>
                        <strong className="text-neutral-900">
                          Cães, gatos e maus-tratos:
                        </strong>{" "}
                        {canal.caesEGatos}
                      </p>
                      <p>
                        <strong className="text-neutral-900">
                          Animais de grande porte:
                        </strong>{" "}
                        {canal.grandePorte}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-200/70 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{canal.observacao}</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Importante:</strong> os serviços municipais normalmente não
                recolhem animais sadios na rua (apenas casos de atropelamento grave,
                risco sanitário, maus-tratos ou grande porte em via pública, conforme
                o município). Sempre anote o número de protocolo informado pelo
                atendente.
              </p>
            </div>
          </section>

          {/* Cards Rápidos de Orientação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  Triagem por Gravidade
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                  Casos com ferimentos graves ou risco de atropelamento têm
                  prioridade máxima na análise.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  Poder do Lar Temporário
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                  Se puder oferecer abrigo temporário enquanto organizamos o
                  atendimento, marque no formulário.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  Retorno pelo WhatsApp
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                  Após o envio, você recebe seu número de protocolo na tela e nossa
                  equipe pode falar com você pelo WhatsApp.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================
              PARTE 2: FORMULÁRIO DE REGISTRO DE ANIMAL ENCONTRADO
          ======================================================== */}
          <div className="space-y-3">
            <div className="px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700 block">
                Passo 2 • Registro no Projeto Esperança Animal
              </span>
              <h2 className="text-2xl font-black text-neutral-950">
                Formulário para Registrar Animal Encontrado
              </h2>
            </div>

            <FormChamado />
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
