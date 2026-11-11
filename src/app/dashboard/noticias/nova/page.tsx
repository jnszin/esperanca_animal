import { requireAuth } from "@/lib/auth-checks";
import { FormNoticia } from "@/components/form-noticia";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publicar Notícia | Projeto Esperança Animal",
  description: "Formulário de criação de posts para o Blog do projeto.",
};

export default async function NovaNoticiaPage() {
  await requireAuth();

  return (
    <div className="min-h-screen bg-neutral-100/60 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard/noticias"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar à Gestão do Blog</span>
          </Link>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
              Publicar Nova Matéria no Blog
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Compartilhe projetos realizados, resgates emocionantes ou orientações veterinárias para a comunidade.
            </p>
          </div>
        </div>

        <FormNoticia />
      </div>
    </div>
  );
}

