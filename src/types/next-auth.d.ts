import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    nome: string;
    email: string;
    cargo: Role;
    whatsapp?: string | null;
  }

  interface Session {
    user: {
      id: string;
      nome: string;
      email: string;
      cargo: Role;
      whatsapp?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nome: string;
    cargo: Role;
    whatsapp?: string | null;
  }
}

