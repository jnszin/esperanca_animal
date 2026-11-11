"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/actions/auth";
import {
  Lock,
  Mail,
  Loader2,
  PawPrint,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

interface AdminLoginFormProps {
  callbackUrl?: string;
}

/** Formulário de autenticação exclusiva para o painel administrativo via /admin. */
export function AdminLoginForm({
  callbackUrl = "/dashboard",
}: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeDestination =
    callbackUrl.startsWith("/dashboard") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/dashboard";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginAction({ email, password });

      if (!result.success) {
        setError(result.error || "Credenciais inválidas.");
        setLoading(false);
        return;
      }

      router.push(safeDestination);
      router.refresh();
    } catch {
      setError("Ocorreu um erro ao tentar entrar. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
            <PawPrint className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Projeto Esperança Animal
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Acesso Restrito ao Painel Administrativo
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2"
            >
              E-mail Administrativo
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@projetoesperancaanimal.com.br"
                className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2"
            >
              Senha
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20 text-sm flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <span>Entrar no Painel</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col items-center gap-3 text-center">
          <p className="text-xs text-neutral-400">
            Área de uso exclusivo da administração do projeto.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao site público</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

