import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Scale,
  Calendar,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import type { Metadata } from "next";

interface AnimalSlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Geração dinâmica de metadados para SEO e redes sociais (OpenGraph)
export async function generateMetadata({
  params,
}: AnimalSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const animal = await prisma.animal.findUnique({
    where: { slug },
    select: { nome: true, especie: true, raca: true, historia: true },
  });

  if (!animal) {
    return { title: "Animal não encontrado | Esperança Animal" };
  }

  return {
    title: `Adote ${animal.nome} | Esperança Animal`,
    description: animal.historia.slice(0, 160),
  };
}

export default async function AnimalSlugPage({ params }: AnimalSlugPageProps) {
  const { slug } = await params;

  const animal = await prisma.animal.findUnique({
    where: { slug },
    include: {
      fotos: {
        orderBy: [{ principal: "desc" }, { ordem: "asc" }],
      },
    },
  });

  if (!animal || !animal.ativo) {
    notFound();
  }

  const fotoPrincipal =
    animal.fotos[0]?.url ||
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800";

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <PublicHeader />

      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Navegação de Volta */}
          <div>
            <Link
              href="/animais"
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-emerald-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para a vitrine de animais</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Coluna Esquerda: Galeria de Fotos */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-neutral-100 shadow-md border border-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fotoPrincipal}
                  alt={animal.nome}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-neutral-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  {animal.especie === "CACHORRO" ? "🐶 Cachorro" : "🐱 Gato"} •{" "}
                  {animal.porte}
                </div>

                {animal.exigeTelaProtecao && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Exige Telas de Proteção</span>
                  </div>
                )}
              </div>

              {/* Miniaturas de outras fotos */}
              {animal.fotos.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {animal.fotos.map((foto) => (
                    <div
                      key={foto.id}
                      className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-2xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={foto.url}
                        alt={`Foto de ${animal.nome}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Temperamento */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 space-y-3">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Personalidade & Temperamento</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {animal.temperamento.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* História do Resgate */}
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 space-y-4">
                <h3 className="text-lg font-bold text-neutral-950">A história do {animal.nome}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                  {animal.historia}
                </p>
              </div>
            </div>

            {/* Coluna Direita: Informações & Card de Adoção */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-black text-neutral-950">
                      {animal.nome}
                    </h1>
                    <span className="text-xs px-3 py-1 bg-neutral-100 text-neutral-700 font-bold rounded-full">
                      {animal.sexo === "MACHO" ? "Macho" : "Fêmea"}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">
                    {animal.raca} • Resgatado pela Esperança Animal
                  </p>
                </div>

                {/* Métricas do Pet */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="text-[11px] text-neutral-400 block font-medium">Idade</span>
                      <span className="text-xs font-bold text-neutral-800">
                        {Math.floor(animal.idadeEstimadaMeses / 12)} anos ({animal.idadeEstimadaMeses}m)
                      </span>
                    </div>
                  </div>

                  <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 flex items-center gap-3">
                    <Scale className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="text-[11px] text-neutral-400 block font-medium">Peso</span>
                      <span className="text-xs font-bold text-neutral-800">
                        {animal.pesoKg ? `${animal.pesoKg} kg` : "Não inf."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Veterinário */}
                <div className="space-y-2.5 pt-4 border-t border-neutral-100">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Saúde & Protocolos
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-neutral-700">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          animal.castrado ? "text-emerald-600" : "text-neutral-300"
                        }`}
                      />
                      <span>{animal.castrado ? "Castrado" : "Não castrado"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-700">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          animal.vacinado ? "text-emerald-600" : "text-neutral-300"
                        }`}
                      />
                      <span>{animal.vacinado ? "Carteira de Vacinação em Dia" : "Vacinação pendente"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-700">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          animal.vermifugado ? "text-emerald-600" : "text-neutral-300"
                        }`}
                      />
                      <span>{animal.vermifugado ? "Vermifugado recentemente" : "Pendente"}</span>
                    </div>

                    {animal.descricaoSaude && (
                      <p className="text-[11px] text-neutral-500 pt-1 italic">
                        &quot;{animal.descricaoSaude}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Botão de Ação para o Formulário de Adoção */}
                <div className="pt-4 border-t border-neutral-100 space-y-3">
                  <Link
                    href={`/animais/${animal.slug}/adotar`}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm transition active:scale-[0.98]"
                  >
                    <Heart className="w-5 h-5 fill-white" />
                    <span>Iniciar Formulário de Adoção</span>
                  </Link>

                  <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                    Você responderá a um questionário rápido de 3 etapas. A triagem
                    calcula a compatibilidade na hora e gera seu protocolo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
