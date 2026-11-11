import { requireAuth } from "@/lib/auth-checks";
import { prisma } from "@/lib/prisma";
import { FormNoticia } from "@/components/form-noticia";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar Matéria | Projeto Esperança Animal",
  description: "Formulário de edição de conteúdo e imagem de capa do blog.",
};

interface EditarNoticiaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarNoticiaPage({ params }: EditarNoticiaPageProps) {
  await requireAuth();

  const { id } = await params;

  const noticia = await prisma.noticia.findUnique({
    where: { id },
  });

  if (!noticia) {
    notFound();
  }

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

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
                Editar Matéria: {noticia.titulo}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Atualize o conteúdo, modifique a imagem de capa ou altere a categoria.
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
              noticia.publicado
                ? "bg-emerald-100 text-emerald-900 border-emerald-200"
                : "bg-amber-100 text-amber-900 border-amber-200"
            }`}
          >
            {noticia.publicado ? "Publicado" : "Rascunho"}
          </span>
        </div>

        <FormNoticia noticiaExistente={noticia} />
      </div>
    </div>
  );
}

