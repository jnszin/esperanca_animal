import { Metadata } from "next";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { EmConstrucao } from "@/components/em-construcao";

export const metadata: Metadata = {
  title: "Doações Pix & Campanhas | Esperança Animal",
  description: "Módulo de doações dinâmicas via Pix e campanhas de arrecadação da ONG Esperança Animal.",
};

export default function DoacoesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center">
        <EmConstrucao
          titulo="Módulo de Doações Pix & Campanhas"
          subtitulo="Estamos integrando o gateway de pagamentos Pix com QR Code dinâmico e baixa automática por webhook sem conferência manual de comprovantes."
          modulo="Módulo de Doações"
          previsao="Em Breve"
        />
      </main>

      <PublicFooter />
    </div>
  );
}

