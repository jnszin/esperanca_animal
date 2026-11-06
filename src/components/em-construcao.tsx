import Link from "next/link";
import { Hammer, PawPrint, ArrowLeft, PhoneCall, Sparkles } from "lucide-react";

interface EmConstrucaoProps {
  titulo?: string;
  subtitulo?: string;
  modulo?: string;
  previsao?: string;
}

export function EmConstrucao({
  titulo = "Funcionalidade em Desenvolvimento",
  subtitulo = "Estamos construindo este módulo para aprimorar ainda mais o atendimento e a gestão da ONG.",
  modulo = "Em Breve",
  previsao = "Próxima Etapa do Projeto",
}: EmConstrucaoProps) {
  return (
    <div className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-neutral-200/80 text-center space-y-6">
        {/* Badge Animado */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wide">
          <Hammer className="w-3.5 h-3.5 text-amber-700 animate-bounce" />
          <span>{modulo} • {previsao}</span>
        </div>

        {/* Ícone Central */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center shadow-inner">
            <PawPrint className="w-12 h-12" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Textos */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
            {titulo}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-lg mx-auto leading-relaxed">
            {subtitulo}
          </p>
        </div>

        {/* Caixa de Contexto Acadêmico / Projeto Integrador */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-500 leading-relaxed max-w-md mx-auto">
          Esta tela faz parte do roadmap de evolução da plataforma <strong>Patas em Dia / Esperança Animal</strong> e será ativada na próxima fase de integração.
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </Link>

          <Link
            href="/animais"
            className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20"
          >
            <PawPrint className="w-4 h-4" />
            <span>Ver Animais para Adoção</span>
          </Link>

          <Link
            href="/chamados"
            className="w-full sm:w-auto px-6 py-3.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition border border-red-200"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Pedir Resgate</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

