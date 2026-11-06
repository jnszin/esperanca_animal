import { requireAdmin } from "@/lib/auth-checks";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserCheck } from "lucide-react";

export default async function UsuariosDashboardPage() {
  // Defesa em profundidade: Se o usuário não for ADMIN, a execução é abortada aqui
  const admin = await requireAdmin();

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

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">
                Gestão de Usuários & Voluntários
              </h1>
              <p className="text-xs text-neutral-500">
                Área restrita exclusivamente para Administradores
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-sm flex items-center gap-3">
            <UserCheck className="w-5 h-5 flex-shrink-0" />
            <span>
              Acesso autorizado para: <strong>{admin.nome}</strong> ({admin.email}) como{" "}
              <strong>ADMIN</strong>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

