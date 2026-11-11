"use server";

import { signIn, signOut } from "@/auth";
import { loginSchema, LoginInput } from "@/schemas/auth";
import { AuthError } from "next-auth";

export type LoginActionResult = {
  success: boolean;
  error?: string;
};

export async function loginAction(data: LoginInput): Promise<LoginActionResult> {
  const validated = loginSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Dados de formulário inválidos.",
    };
  }

  try {
    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: "E-mail ou senha incorretos.",
          };
        default:
          return {
            success: false,
            error: "Falha na autenticação. Verifique os dados e tente novamente.",
          };
      }
    }

    // Se o erro for de redirecionamento interno do Next.js, propaga
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest: unknown }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    return {
      success: false,
      error: "Ocorreu um erro inesperado ao tentar entrar.",
    };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin" });
}
