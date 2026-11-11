import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { GaleriaAnimal } from "@/components/galeria-animal";
import {
  CONTATO_ONG_ADOCAO,
  formatarIdadeAproximada,
  formatarPorteAnimal,
  gerarLinkWhatsappInteresseAnimal,
  obterFaixaEtariaAnimal,
} from "@/lib/animal-labels";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Scale,
  Calendar,
  Sparkles,
  AlertTriangle,
  Ruler,
  PhoneCall,
  Mail,
  MapPin,
} from "lucide-react";
import type { Metadata } from "next";

interface AnimalSlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

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

  const faixaEtaria = obterFaixaEtariaAnimal(animal.idadeEstimadaMeses);
  const idadeAproximada = formatarIdadeAproximada(animal.idadeEstimadaMeses);
  const porteFormatado = formatarPorteAnimal(animal.porte);
  const wppInteresseUrl = gerarLinkWhatsappInteresseAnimal({
    nome: animal.nome,
    porte: animal.porte,
    idadeEstimadaMeses: animal.idadeEstimadaMeses,
  });
  const emailAssunto = encodeURIComponent(
    `Interesse em adotar ${animal.nome} (${porteFormatado})`
  );

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
            {/* Coluna Esquerda: Galeria, Características e História */}
            <div className="lg:col-span-7 space-y-6">
              <GaleriaAnimal
                nome={animal.nome}
                especie={animal.especie}
                porte={animal.porte}
                idadeEstimadaMeses={animal.idadeEstimadaMeses}
                exigeTelaProtecao={animal.exigeTelaProtecao}
                fotos={animal.fotos.map((f) => ({ id: f.id, url: f.url }))}
              />

              {/* Características & Temperamento */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 space-y-3">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Características &amp; Temperamento</span>
                </h3>
                {animal.temperamento.length > 0 ? (
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
                ) : (
                  <p className="text-xs text-neutral-500">
                    Perfil comportamental em avaliação com a equipe de acolhimento.
                  </p>
                )}
              </div>

              {/* História do Resgate */}
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 space-y-4">
                <h3 className="text-lg font-bold text-neutral-950">
                  A história de {animal.nome}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                  {animal.historia}
                </p>
              </div>
            </div>

            {/* Coluna Direita: Ficha Resumida, Adoção e Contato Direto */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h1 className="text-3xl font-black text-neutral-950">
                      {animal.nome}
                    </h1>
                    <span className="text-xs px-3 py-1 bg-neutral-100 text-neutral-700 font-bold rounded-full shrink-0">
                      {animal.sexo === "MACHO" ? "Macho" : "Fêmea"}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">
                    {animal.raca} • Acolhido pela Esperança Animal
                  </p>
                </div>

                {/* Ficha Técnica do Animal */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[11px] text-neutral-500 block font-medium">
                        Idade aproximada
                      </span>
                      <span className="text-xs font-bold text-neutral-900">
                        ~{idadeAproximada} ({faixaEtaria.labelSingular})
                      </span>
                    </div>
                  </div>

                  <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 flex items-center gap-3">
                    <Ruler className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[11px] text-neutral-500 block font-medium">
                        Porte
                      </span>
                      <span className="text-xs font-bold text-neutral-900">
                        {porteFormatado}
                      </span>
                    </div>
                  </div>

                  {animal.pesoKg && (
                    <div className="col-span-2 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 flex items-center gap-3">
                      <Scale className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[11px] text-neutral-500 block font-medium">
                          Peso aproximado
                        </span>
                        <span className="text-xs font-bold text-neutral-900">
                          {String(animal.pesoKg)} kg
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Veterinário */}
                <div className="space-y-2.5 pt-4 border-t border-neutral-100">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Saúde &amp; Cuidados
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-neutral-700">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          animal.castrado ? "text-emerald-600" : "text-neutral-300"
                        }`}
                      />
                      <span>
                        {animal.castrado ? "Castrado" : "Castração programada"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-700">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          animal.vacinado ? "text-emerald-600" : "text-neutral-300"
                        }`}
                      />
                      <span>
                        {animal.vacinado
                          ? "Carteira de vacinação em dia"
                          : "Vacinação em andamento"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-700">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          animal.vermifugado ? "text-emerald-600" : "text-neutral-300"
                        }`}
                      />
                      <span>
                        {animal.vermifugado
                          ? "Vermifugado recentemente"
                          : "Vermifugação pendente"}
                      </span>
                    </div>

                    {animal.necessidadesEspeciais && (
                      <div className="flex items-center gap-2 text-amber-800 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Animal com cuidados especiais</span>
                      </div>
                    )}

                    {animal.descricaoSaude && (
                      <p className="text-[11px] text-neutral-500 pt-1 italic">
                        &quot;{animal.descricaoSaude}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Ação de Adoção */}
                <div className="pt-4 border-t border-neutral-100 space-y-3">
                  {animal.status === "DISPONIVEL" ? (
                    <>
                      <Link
                        href={`/animais/${animal.slug}/adotar`}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm transition active:scale-[0.98]"
                      >
                        <Heart className="w-5 h-5 fill-white" />
                        <span>Iniciar Formulário de Adoção</span>
                      </Link>

                      <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
                        Preencha o questionário de 3 etapas para gerar seu protocolo e
                        agilizar nossa conversa sobre {animal.nome}.
                      </p>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
                        <p className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            {animal.status === "ADOTADO"
                              ? "Final Feliz Alcançado!"
                              : animal.status === "EM_PROCESSO"
                                ? "Em Processo de Adoção"
                                : animal.status === "EM_TRATAMENTO"
                                  ? "Em Recuperação Veterinária"
                                  : "Indisponível para Adoção"}
                          </span>
                        </p>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          {animal.status === "ADOTADO"
                            ? `${animal.nome} já foi adotado e está feliz com sua nova família.`
                            : animal.status === "EM_PROCESSO"
                              ? `${animal.nome} já está em fase avançada de avaliação com uma família candidata.`
                              : animal.status === "EM_TRATAMENTO"
                                ? `${animal.nome} está recebendo cuidados veterinários no momento e voltará à vitrine em breve.`
                                : `${animal.nome} não está aceitando novas solicitações de adoção no momento.`}
                        </p>
                      </div>

                      <Link
                        href="/animais"
                        className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm transition"
                      >
                        <span>Conhecer Outros Pets Disponíveis</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações para Contato Direto */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-950">
                    Informações para Contato
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Quer tirar dúvidas sobre {animal.nome} ou agendar uma visita? Fale
                    com a equipe da Esperança Animal:
                  </p>
                </div>

                <a
                  href={wppInteresseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>
                    WhatsApp: {CONTATO_ONG_ADOCAO.whatsappVisual}
                  </span>
                </a>

                <div className="space-y-2 pt-1 text-xs text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                    <a
                      href={`mailto:${CONTATO_ONG_ADOCAO.email}?subject=${emailAssunto}`}
                      className="hover:text-emerald-700 font-medium break-all transition"
                    >
                      {CONTATO_ONG_ADOCAO.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{CONTATO_ONG_ADOCAO.regiaoAtendimento}</span>
                  </div>
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
