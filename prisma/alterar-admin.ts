import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();

function perguntar(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

async function main() {
  console.log("==========================================");
  console.log("🔐 Atualização de Administrador (Esperança Animal)");
  console.log("==========================================\n");

  const args = process.argv.slice(2);
  let email = args[0]?.trim().toLowerCase();
  let senha = args[1]?.trim();
  let nome = args[2]?.trim();

  if (!email) {
    email = (await perguntar("Digite o e-mail do administrador: ")).toLowerCase();
  }

  if (!email || !email.includes("@")) {
    console.error("❌ Erro: Informe um e-mail válido.");
    process.exit(1);
  }

  if (!senha) {
    senha = await perguntar("Digite a nova senha (mínimo 6 caracteres): ");
  }

  if (!senha || senha.length < 6) {
    console.error("❌ Erro: A senha deve ter no mínimo 6 caracteres.");
    process.exit(1);
  }

  if (!nome) {
    const nomeInput = await perguntar(
      "Digite o nome do admin (Enter para 'Administradora Daniela'): "
    );
    nome = nomeInput || "Administradora Daniela";
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      nome,
      senhaHash,
      cargo: Role.ADMIN,
      ativo: true,
    },
    create: {
      nome,
      email,
      senhaHash,
      cargo: Role.ADMIN,
      ativo: true,
    },
  });

  // Desativa e revoga imediatamente qualquer outro administrador anterior
  // e as contas de demonstração iniciais (admin@esperancaanimal.ong.br e voluntario)
  const desativados = await prisma.user.updateMany({
    where: {
      id: { not: admin.id },
      OR: [
        { cargo: Role.ADMIN },
        { email: "admin@esperancaanimal.ong.br" },
        { email: "voluntario@esperancaanimal.ong.br" },
      ],
    },
    data: {
      ativo: false,
      cargo: Role.VOLUNTARIO,
      senhaHash: "$2a$10$DISABLED_ACCOUNT_NEVER_MATCHES_BCRYPT_HASH",
    },
  });

  console.log("\n------------------------------------------");
  console.log("✅ Credenciais salvas com sucesso!");
  console.log(`👤 Nome:  ${admin.nome}`);
  console.log(`📧 E-mail: ${admin.email}`);
  console.log(`🔑 Senha: [Atualizada com criptografia bcrypt]`);
  console.log(`🛡️ Cargo:  ADMIN (Ativo)`);
  if (desativados.count > 0) {
    console.log(`🚫 Contas antigas desativadas: ${desativados.count} usuário(s) revogado(s)`);
  }
  console.log("------------------------------------------");
  console.log("👉 Já pode entrar pelo painel: /admin\n");
}

main()
  .catch((err) => {
    console.error("\n❌ Falha ao atualizar credenciais:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
