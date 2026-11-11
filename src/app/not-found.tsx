import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { EmConstrucao } from "@/components/em-construcao";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página em Construção | Projeto Esperança Animal",
  description: "Esta página ou funcionalidade está em fase de desenvolvimento no Projeto Esperança Animal.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center">
        <EmConstrucao
          titulo="Página em Construção ou Não Encontrada (404)"
          subtitulo="O link que você tentou acessar ainda está em desenvolvimento ou em fase de manutenção pela equipe técnica."
          modulo="Módulo em Desenvolvimento"
          previsao="Fase Futura"
        />
      </main>

      <PublicFooter />
    </div>
  );
}

