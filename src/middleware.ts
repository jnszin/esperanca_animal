import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isWebhookRoute = nextUrl.pathname.startsWith("/api/webhooks");
  const isAdminRoute =
    nextUrl.pathname === "/admin" || nextUrl.pathname.startsWith("/admin/");

  // ========================================================
  // 1. BLINDAGEM DE WEBHOOKS (EDGE RUNTIME)
  // Exige cabeçalho x-webhook-secret matching com WEBHOOK_SECRET
  // ========================================================
  if (isWebhookRoute) {
    const webhookSecret = req.headers.get("x-webhook-secret");
    const expectedSecret = process.env.WEBHOOK_SECRET;

    if (!expectedSecret || webhookSecret !== expectedSecret) {
      return new NextResponse(
        JSON.stringify({
          error: "Acesso não autorizado: token de webhook inválido ou ausente.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return NextResponse.next();
  }

  // ========================================================
  // 2. PROTEÇÃO DE ROTAS DO BACKOFFICE (Lê apenas o token em memória)
  // ZERO consultas ao PostgreSQL / Prisma na borda
  // ========================================================
  const isLoggedIn = !!req.auth?.user;
  const userCargo = req.auth?.user?.cargo;

  if (isDashboardRoute) {
    if (!isLoggedIn) {
      const adminLoginUrl = new URL("/admin", nextUrl.origin);
      adminLoginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(adminLoginUrl);
    }

    // Rotas restritas exclusivamente para ADMIN
    const isAdminOnlyRoute =
      nextUrl.pathname.startsWith("/dashboard/usuarios") ||
      nextUrl.pathname.startsWith("/dashboard/configuracoes");

    if (isAdminOnlyRoute && userCargo !== "ADMIN") {
      // Voluntário tentando acessar área restrita -> redireciona para a raiz do dashboard
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }

    return NextResponse.next();
  }

  // 3. Acesso à rota dedicada /admin:
  // Se já estiver logado, redireciona para /dashboard; subrotas de /admin sem sessão retornam para /admin
  if (isAdminRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }
    if (nextUrl.pathname.startsWith("/admin/")) {
      return NextResponse.redirect(new URL("/admin", nextUrl.origin));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/webhooks/:path*",
    "/admin",
    "/admin/:path*",
  ],
};

