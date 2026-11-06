import { auth } from "@/auth";
import { Role } from "@prisma/client";

/**
 * Obtém o usuário autenticado da sessão atual.
 * Retorna null se não houver usuário logado.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Garante que a requisição / Server Action é executada por um usuário autenticado.
 * Lança erro se não houver sessão ativa. (Defesa em Profundidade)
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    throw new Error("Acesso não autorizado. Faça login para continuar.");
  }
  return user;
}

/**
 * Garante que a requisição / Server Action é executada por um ADMIN.
 * Lança erro se o usuário não for ADMIN. (Defesa em Profundidade)
 */
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.cargo !== Role.ADMIN) {
    throw new Error("Permissão insuficiente. Esta ação requer privilégios de Administrador.");
  }
  return user;
}

/**
 * Garante que a requisição é executada por usuários com cargos específicos permitidos.
 */
export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.cargo)) {
    throw new Error("Permissão insuficiente para executar esta ação.");
  }
  return user;
}

