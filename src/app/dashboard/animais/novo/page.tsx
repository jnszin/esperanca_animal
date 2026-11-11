import { requireAuth } from "@/lib/auth-checks";
import { FormCadastroAnimal } from "@/components/form-cadastro-animal";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Metadata } from "next";
import { Especie } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Cadastrar Novo Animal | Projeto Esperança Animal",
  description: "Formulário de inclusão de pet na vitrine pública com upload de fotos no Cloudflare R2.",
};

interface NovoAnimalPageProps {
  searchParams: Promise<{
    chamadoId?: string;
    nome?: string;
    especie?: string;
  }>;
}

export default async function NovoAnimalPage({ searchParams }: NovoAnimalPageProps) {
  await requireAuth();

  const params = await searchParams;

  let chamadoInfo = null;
  if (params.chamadoId) {
    chamadoInfo = await prisma.chamadoAcolhimento.findUnique({
      where: { id: params.chamadoId },
      select: {
        id: true,
        protocolo: true,
        especie: true,
        bairro: true,
      },
    });
  }

  let especieValida: Especie | undefined = undefined;
  if (params.especie && Object.values(Especie).includes(params.especie as Especie)) {
    especieValida = params.especie as Especie;
  } else if (chamadoInfo) {
    especieValida = chamadoInfo.especie;
  }

  const nomeSugerido = params.nome || "";

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

        {/* Topo do Formulário */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
                Cadastrar Novo Animal
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Preencha a ficha clínica e comportamental do pet para publicação na vitrine de adoção.
              </p>
            </div>
          </div>

          {chamadoInfo && (
            <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center justify-between">
              <div>
                <strong>Resgate Vinculado:</strong> Chamado{" "}
                <span className="font-mono font-bold">{chamadoInfo.protocolo}</span> (
                {chamadoInfo.bairro})
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-200 text-blue-900 rounded-full">
                Auto-Conclusão Ativa
              </span>
            </div>
          )}
        </div>

        {/* Formulário Client Component com Upload Sharp + R2 */}
        <FormCadastroAnimal
          chamadoOrigemId={params.chamadoId}
          nomeSugerido={nomeSugerido}
          especieSugerida={especieValida}
        />
      </div>
    </div>
  );
}
