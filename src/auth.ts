import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { loginSchema } from "@/schemas/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) {
          return null;
        }

        const { email, password } = validated.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.senhaHash || !user.ativo) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.senhaHash);
        if (!passwordMatch) {
          return null;
        }

        // Atualiza a data de último acesso de forma não-bloqueante
        prisma.user
          .update({
            where: { id: user.id },
            data: { ultimoAcesso: new Date() },
          })
          .catch(() => {
            // Ignora erro eventual para não travar o fluxo de login
          });

        return {
          id: user.id,
          nome: user.nome,
          email: user.email,
          cargo: user.cargo,
          whatsapp: user.whatsapp,
        };
      },
    }),
  ],
});

