import { requireAuth } from "@/lib/auth-checks";
import { logoutAction } from "@/actions/auth";
import Link from "next/link";
import { PawPrint, LogOut, Users, HeartHandshake, ShieldAlert, CheckCircle2 } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-neutral-100/60 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header do Backoffice */}
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold">
              <PawPrint className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900">
                  Olá, {user.nome}!
                </h1>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                    user.cargo === "ADMIN"
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}
                >
                  {user.cargo}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {user.email} • Esperança Animal Backoffice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.cargo === "ADMIN" && (
              <Link
                href="/dashboard/usuarios"
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition"
              >
                <Users className="w-4 h-4" />
                <span>Gestão de Voluntários</span>
              </Link>
            )}

            <form action={logoutAction}>
              <button
                type="submit"
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition border border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </form>
          </div>
        </header>

        {/* Resumo de Segurança e Defesa em Profundidade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Edge Middleware</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Sessão JWT validada em memória na borda sem queries ao PostgreSQL.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Defesa em Profundidade</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Server Actions checam cargo antes de qualquer transação com o Prisma.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Segurança RBAC</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Segregação estrita de privilégios entre VOLUNTARIO e ADMIN.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

