import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata: Metadata = {
  title: "Acesso Administrativo | Esperança Animal",
  description: "Entrada restrita da administração da ONG Esperança Animal.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface AdminPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

/** Rota dedicada /admin para autenticação e acesso ao painel administrativo (/dashboard). */
export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await auth();
  const resolvedParams = await searchParams;
  const rawCallback = resolvedParams?.callbackUrl;
  const safeCallback =
    rawCallback &&
    rawCallback.startsWith("/dashboard") &&
    !rawCallback.startsWith("//")
      ? rawCallback
      : "/dashboard";

  if (session?.user) {
    redirect(safeCallback);
  }

  return <AdminLoginForm callbackUrl={safeCallback} />;
}

