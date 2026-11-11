import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin",
    error: "/admin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nome = user.nome;
        token.cargo = user.cargo;
        token.whatsapp = user.whatsapp;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.nome = token.nome as string;
        session.user.cargo = token.cargo as Role;
        session.user.whatsapp = token.whatsapp as string | null | undefined;
      }
      return session;
    },
  },
  providers: [], // Configurado em src/auth.ts com CredentialsProvider
};
