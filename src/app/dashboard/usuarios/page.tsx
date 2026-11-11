import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-checks";

export default async function UsuariosDashboardPage() {
  await requireAdmin();
  redirect("/dashboard");
}
