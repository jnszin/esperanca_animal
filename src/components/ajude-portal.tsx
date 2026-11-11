"use client";

import { useState } from "react";
import { FormAjuda } from "@/components/form-ajuda";
import { FormVoluntario } from "@/components/form-voluntario";
import type { ModalidadeVoluntariado, TipoAjudaONG } from "@prisma/client";
import {
  ArrowDown,
  Droplets,
  Footprints,
  HandHeart,
  Heart,
  Home,
  Package,
  Pill,
  QrCode,
  Sparkles,
} from "lucide-react";

export type AbaAjudePortal = "doacoes" | "voluntarios";

interface AjudePortalProps {
  initialAba?: AbaAjudePortal;
}

export function AjudePortal({ initialAba = "doacoes" }: AjudePortalProps) {
  const [abaAtiva, setAbaAtiva] = useState<AbaAjudePortal>(initialAba);
  const [tipoAjuda, setTipoAjuda] = useState<TipoAjudaONG>("RACAO");
  const [mensagem, setMensagem] = useState("");
  const [modalidadeVoluntario, setModalidadeVoluntario] =
    useState<ModalidadeVoluntariado>("PASSEIOS");

  function handleSelecionarFinanceiro() {
    setTipoAjuda("FINANCEIRO");
    if (!mensagem.trim()) {
      setMensagem(
        "Olá equipe! Gostaria de contribuir financeiramente para ajudar nas despesas de ração, vacinas ou atendimento veterinário."
      );
    }
    const formEl = document.getElementById("formulario-ajuda");
    formEl?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSelecionarModalidadeVoluntario(mod: ModalidadeVoluntariado) {
    setModalidadeVoluntario(mod);
    const formEl = document.getElementById("formulario-voluntario");
    formEl?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-8">
      {/* Seletor Principal: Doações & Insumos vs Área de Voluntários */}
      <div className="bg-white p-2 rounded-3xl border border-neutral-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setAbaAtiva("doacoes")}
          className={`flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-left transition cursor-pointer ${
            abaAtiva === "doacoes"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
          }`}
        >
          <Package
            className={`w-5 h-5 shrink-0 ${
              abaAtiva === "doacoes" ? "text-emerald-100" : "text-amber-600"
            }`}
          />
          <div>
            <span className="block text-sm font-extrabold">
              Doações &amp; Insumos
            </span>
            <span
              className={`block text-[11px] ${
                abaAtiva === "doacoes"
                  ? "text-emerald-100"
                  : "text-neutral-500"
              }`}
            >
              Ração, shampoos, remédios ou apoio financeiro
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva("voluntarios")}
          className={`flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-left transition cursor-pointer ${
            abaAtiva === "voluntarios"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
          }`}
        >
          <HandHeart
            className={`w-5 h-5 shrink-0 ${
              abaAtiva === "voluntarios"
                ? "text-emerald-100"
                : "text-emerald-600"
            }`}
          />
          <div>
            <span className="block text-sm font-extrabold">
              Área de Voluntários
            </span>
            <span
              className={`block text-[11px] ${
                abaAtiva === "voluntarios"
                  ? "text-emerald-100"
                  : "text-neutral-500"
              }`}
            >
              Passeios, lar temporário e voluntariado personalizado
            </span>
          </div>
        </button>
      </div>

      {abaAtiva === "doacoes" ? (
        <div className="space-y-10">
          {/* Bloco Dual: Ajuda Financeira + Insumos em Alta Demanda */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Doação Financeira */}
            <div className="lg:col-span-6 bg-linear-to-br from-neutral-900 to-emerald-950 text-white rounded-3xl p-7 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Doações Financeiras</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Apoie com qualquer valor
                </h2>

                <p className="text-sm text-neutral-300 leading-relaxed">
                  Toda contribuição financeira vai direto para cirurgias de
                  emergência, vacinação, vermifugação e compra de sacos de ração
                  para os resgatados.
                </p>

                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-xs text-emerald-100 leading-relaxed space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Pix Automático em Alinhamento</span>
                  </p>
                  <p>
                    Estamos finalizando com a direção o canal oficial de QR Code
                    Pix com recibo automático. Enquanto isso, você pode combinar
                    sua contribuição diretamente abaixo no formulário com total
                    segurança.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSelecionarFinanceiro}
                className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950/50"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Quero Combinar Doação Financeira</span>
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            {/* Doação de Insumos */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-7 sm:p-8 border border-neutral-200/80 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
                  <Package className="w-4 h-4" />
                  <span>Doação de Itens &amp; Insumos</span>
                </span>

                <h2 className="text-2xl font-black text-neutral-900">
                  O que ajuda todos os dias no abrigo
                </h2>

                <p className="text-sm text-neutral-600 leading-relaxed">
                  Muitas vezes você tem itens sobrando em casa que fazem toda a
                  diferença para dezenas de animais acolhidos. Veja o que mais
                  precisamos:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 space-y-1">
                    <p className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-amber-700" />
                      <span>Ração Animal</span>
                    </p>
                    <p className="text-[11px] text-amber-900/85">
                      Sacos abertos ou fechados de cão, gato ou filhote em bom
                      estado.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 space-y-1">
                    <p className="text-xs font-extrabold text-sky-950 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-sky-700" />
                      <span>Shampoos &amp; Limpeza</span>
                    </p>
                    <p className="text-[11px] text-sky-900/85">
                      Shampoo p/ cães e gatos, sabonete sarnicida, tapete e
                      desinfetante.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 space-y-1">
                    <p className="text-xs font-extrabold text-red-950 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-red-600" />
                      <span>Medicamentos</span>
                    </p>
                    <p className="text-[11px] text-red-900/85">
                      Vermífugos, antipulgas, soro e curativos dentro da validade.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 space-y-1">
                    <p className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-purple-600" />
                      <span>Cobertores &amp; Potes</span>
                    </p>
                    <p className="text-[11px] text-purple-900/85">
                      Toalhas, mantas, comedouros, caixas de transporte e guias.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-neutral-500">
                  Prefere ajudar com seu tempo, passeios ou lar temporário?
                </span>
                <button
                  type="button"
                  onClick={() => setAbaAtiva("voluntarios")}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Ir para Área de Voluntários →
                </button>
              </div>
            </div>
          </div>

          {/* Formulário Personalizado de Doação/Insumos */}
          <FormAjuda
            tipoAjuda={tipoAjuda}
            onChangeTipoAjuda={setTipoAjuda}
            mensagem={mensagem}
            onChangeMensagem={setMensagem}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* 3 Opções de Voluntariado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <button
              type="button"
              onClick={() => handleSelecionarModalidadeVoluntario("PASSEIOS")}
              className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 text-left transition space-y-3 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-neutral-900">
                  Passeios aos Animais
                </h2>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Ajude os cães resgatados a gastar energia, reduzir o estresse
                  do abrigo e ficarem ainda mais sociáveis para adoção.
                </p>
              </div>
              <span className="inline-block text-xs font-bold text-emerald-700">
                Quero oferecer passeios ↓
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleSelecionarModalidadeVoluntario("LAR_TEMPORARIO")
              }
              className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm hover:shadow-md hover:border-amber-300 text-left transition space-y-3 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-neutral-900">
                  Lar Temporário (LT)
                </h2>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Acolha um animal em recuperação ou filhote por um período
                  combinado enquanto o projeto busca um adotante definitivo.
                </p>
              </div>
              <span className="inline-block text-xs font-bold text-amber-700">
                Posso oferecer lar temporário ↓
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleSelecionarModalidadeVoluntario("PERSONALIZADO")
              }
              className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm hover:shadow-md hover:border-purple-300 text-left transition space-y-3 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-neutral-900">
                  Voluntariado Personalizado
                </h2>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Conte de que outra forma consegue contribuir: carona ao
                  veterinário, banho, fotos, feiras de adoção ou outros apoios.
                </p>
              </div>
              <span className="inline-block text-xs font-bold text-purple-700">
                Explicar minha forma de ajudar ↓
              </span>
            </button>
          </div>

          <FormVoluntario
            modalidade={modalidadeVoluntario}
            onChangeModalidade={setModalidadeVoluntario}
          />
        </div>
      )}
    </div>
  );
}
