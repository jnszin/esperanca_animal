import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { FormAdocaoMultistep } from "@/components/form-adocao-multistep";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

interface AdotarSlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: AdotarSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const animal = await prisma.animal.findUnique({
    where: { slug },
    select: { nome: true },
  });

  if (!animal) {
    return { title: "Adoção | Esperança Animal" };
  }

  return {
    title: `Formulário de Adoção de ${animal.nome} | Esperança Animal`,
    description: `Preencha a pré-triagem de adoção para o pet ${animal.nome}.`,
  };
}

export default async function AdotarSlugPage({ params }: AdotarSlugPageProps) {
  const { slug } = await params;

  // Busca o animal no banco na VPS
  const animal = await prisma.animal.findUnique({
    where: { slug },
    include: {
      fotos: {
        where: { principal: true },
        take: 1,
      },
    },
  });

  if (!animal || !animal.ativo) {
    notFound();
  }

  const fotoPrincipal = animal.fotos[0]?.url;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <PublicHeader />

      <main className="flex-1 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <Link
              href={`/animais/${animal.slug}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-emerald-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para o perfil do {animal.nome}</span>
            </Link>
          </div>

          <FormAdocaoMultistep
            animal={{
              id: animal.id,
              nome: animal.nome,
              slug: animal.slug,
              especie: animal.especie,
              porte: animal.porte,
              exigeTelaProtecao: animal.exigeTelaProtecao,
            }}
            fotoUrl={fotoPrincipal}
          />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

