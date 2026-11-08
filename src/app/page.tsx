import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { LiveRevalidator } from "@/components/live-revalidator";
import { EsteiraAnimais } from "@/components/esteira-animais";
import {
  PawPrint,
  Heart,
  PhoneCall,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default async function HomePage() {
  // Busca os animais disponíveis para a esteira na Home
  const animaisDisponiveis = await prisma.animal.findMany({
    where: {
      status: "DISPONIVEL",
      ativo: true,
    },
    include: {
      fotos: {
        orderBy: [{ principal: "desc" }, { ordem: "asc" }],
        take: 1,
      },
    },
    take: 12,
    orderBy: [{ destaqueVitrine: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <LiveRevalidator intervalMs={45000} />
      <PublicHeader />

      <main className="flex-1">
        {/* ========================================================
            1. HERO SECTION
        ======================================================== */}
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-white to-neutral-50 pt-16 pb-24 md:pt-24 md:pb-32 border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Adoção Consciente & Resgate Animal</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight leading-[1.15]">
                  Dê um lar a quem só tem{" "}
                  <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2">
                    amor para dar
                  </span>
                  .
                </h1>

                <p className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed">
                  Conectamos corações a animais resgatados com triagem automatizada,
                  transparência de saúde e acompanhamento direto no seu WhatsApp.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <Link
                    href="/animais"
                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-3 transition active:scale-[0.98]"
                  >
                    <PawPrint className="w-5 h-5" />
                    <span>Ver Animais para Adoção</span>
                  </Link>

                  <Link
                    href="/chamados"
                    className="px-6 py-4 bg-white hover:bg-neutral-100 text-neutral-800 font-semibold rounded-2xl border border-neutral-200 flex items-center justify-center gap-2 transition"
                  >
                    <PhoneCall className="w-4 h-4 text-red-500" />
                    <span>Pedir Resgate de Emergência</span>
                  </Link>
                </div>

                {/* Métricas de Impacto */}
                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-neutral-200/60 max-w-lg">
                  <div>
                    <span className="block text-2xl font-black text-neutral-900">+350</span>
                    <span className="text-xs text-neutral-500 font-medium">Vidas Salvas</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-emerald-600">100%</span>
                    <span className="text-xs text-neutral-500 font-medium">Castrados & Vacinados</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-neutral-900">0%</span>
                    <span className="text-xs text-neutral-500 font-medium">Eutanásia</span>
                  </div>
                </div>
              </div>

              {/* Card Visual Hero */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200/80 overflow-hidden p-3 rotate-1 hover:rotate-0 transition duration-300">
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800"
                      alt="Cão caramelo para adoção"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      Destaque do Dia
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900">Thor, 1 ano e meio</h3>
                        <p className="text-xs text-neutral-500">Porte Médio • Caramelo Dócil</p>
                      </div>
                      <Link
                        href="/animais"
                        className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. VITRINE DE DESTAQUES
        ======================================================== */}
        <section className="py-20 bg-white border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-1">
                  Amigos de Quatro Patas
                </span>
                <h2 className="text-3xl font-extrabold text-neutral-950">
                  Esperando por uma família com amor
                </h2>
              </div>
              <Link
                href="/animais"
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition"
              >
                <span>Ver todos os animais disponíveis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Esteira Contínua de Animais Disponíveis */}
            <EsteiraAnimais animais={animaisDisponiveis} />
          </div>
        </section>

        {/* ========================================================
            3. COMO FUNCIONA O PROCESSO DE ADOÇÃO CONSCIENTE
        ======================================================== */}
        <section className="py-20 bg-neutral-100/60 border-b border-neutral-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-2">
                Simples, Seguro e Humanizado
              </span>
              <h2 className="text-3xl font-extrabold text-neutral-950">
                Como funciona a adoção responsável?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-xs relative">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-lg flex items-center justify-center mb-6">
                  1
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  Escolha e Pré-Triagem Online
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Escolha o animal compatível com sua rotina e responda ao formulário
                  rápido sobre moradia, espaço físico e convivência.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-xs relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-black text-lg flex items-center justify-center mb-6">
                  2
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  Score de Compatibilidade
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Nosso sistema avalia a compatibilidade de telas, espaço e horários
                  para garantir a segurança de ambas as partes.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-xs relative">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 font-black text-lg flex items-center justify-center mb-6">
                  3
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  Contato pelo WhatsApp com Protocolo
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Você recebe um protocolo instantâneo no WhatsApp e nossos
                  voluntários agendam a entrevista e visita presencial.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. DOAÇÃO PIX & CHAMADOS DE RESGATE
        ======================================================== */}
        <section className="py-20 bg-neutral-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
                  Apoie a Causa
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Não pode adotar agora? Você pode salvar uma vida hoje.
                </h2>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Nossa ONG é mantida 100% por doações voluntárias da comunidade.
                  Cada real doado via Pix vai direto para alimentação, cirurgias,
                  vacinas e abrigo de animais resgatados.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Link
                    href="/doacoes"
                    className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 text-sm transition"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Fazer Doação Pix</span>
                  </Link>
                </div>
              </div>

              <div className="bg-neutral-800 p-8 rounded-3xl border border-neutral-700/80 space-y-4">
                <div className="flex items-center gap-3 text-red-400 font-bold text-sm">
                  <PhoneCall className="w-5 h-5" />
                  <span>Viu um animal em perigo ou maus-tratos?</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Use nossa central de chamados para registrar o resgate com fotos,
                  endereço e classificação de urgência. Nossa equipe recebe a ocorrência
                  em tempo real.
                </p>
                <Link
                  href="/chamados"
                  className="inline-block px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs transition"
                >
                  Abrir Chamado de Acolhimento
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
