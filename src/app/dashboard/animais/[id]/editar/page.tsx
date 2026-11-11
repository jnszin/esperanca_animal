import { requireAuth } from "@/lib/auth-checks";
import { prisma } from "@/lib/prisma";
import { FormEdicaoAnimal } from "@/components/form-edicao-animal";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar Animal | Projeto Esperança Animal",
  description: "Edição completa da ficha clínica, história e fotos do pet.",
};

interface EditarAnimalPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarAnimalPage({ params }: EditarAnimalPageProps) {
  await requireAuth();

  const { id } = await params;

  const animal = await prisma.animal.findUnique({
    where: { id },
    include: {
      fotos: {
        select: {
          id: true,
          url: true,
          principal: true,
        },
        orderBy: [{ principal: "desc" }, { ordem: "asc" }],
      },
    },
  });

  if (!animal) {
    notFound();
  }

  const animalFormatado = {
    ...animal,
    pesoKg: animal.pesoKg ? Number(animal.pesoKg) : null,
  };

  return (
    <div className="min-h-screen bg-neutral-100/60 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navegação de Volta */}
        <div>
          <Link
            href="/dashboard/animais"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Catálogo de Animais</span>
          </Link>
        </div>

        {/* Topo da Edição */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
                Editar Cadastro: {animal.nome}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Atualize informações incorretas, adicione novas fotos ou ajuste o quadro clínico.
              </p>
            </div>
          </div>

          {!animal.ativo && (
            <span className="text-xs font-black uppercase px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
              Animal Arquivado
            </span>
          )}
        </div>

        {/* Formulário de Edição */}
        <FormEdicaoAnimal animal={animalFormatado} />
      </div>
    </div>
  );
}

