import { requireAuth } from "@/lib/auth-checks";
import Link from "next/link";
import { ArrowLeft, Heart, Hammer } from "lucide-react";

export default async function DashboardAdocoesPage() {
  await requireAuth();

  return (
    <div className="min-h-screen bg-neutral-100/60 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Dashboard</span>
        </Link>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-neutral-200/80 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
            <Hammer className="w-3.5 h-3.5 text-blue-700 animate-bounce" />
            <span>Módulo de Backoffice • Em Desenvolvimento</span>
          </div>

          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl mx-auto flex items-center justify-center">
            <Heart className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-neutral-900">
              Painel de Avaliação de Adoções
            </h1>
            <p className="text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
              As solicitações de adoção preenchidas pelo público no formulário inteligente
              já estão sendo salvas no PostgreSQL. A interface visual de aprovação e
              agendamento de entrevistas do voluntário será liberada na próxima fase.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retornar ao Painel Principal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

