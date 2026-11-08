import { PrismaClient, Role, Especie, Porte, Sexo, StatusAnimal, TipoMoradia, StatusAdocao } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados na VPS...");

  // 1. Criar Administrador Padrão
  const adminEmail = "admin@esperancaanimal.ong.br";
  const adminSenhaHash = await bcrypt.hash("Admin@123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      cargo: Role.ADMIN,
      ativo: true,
    },
    create: {
      nome: "Administrador Esperança Animal",
      email: adminEmail,
      senhaHash: adminSenhaHash,
      cargo: Role.ADMIN,
      whatsapp: "5527999990001",
      ativo: true,
    },
  });

  console.log(`✅ Administrador configurado: ${admin.email}`);

  // 2. Criar Voluntário de Demonstração
  const volEmail = "voluntario@esperancaanimal.ong.br";
  const volSenhaHash = await bcrypt.hash("Voluntario@123456", 10);

  const voluntario = await prisma.user.upsert({
    where: { email: volEmail },
    update: {
      cargo: Role.VOLUNTARIO,
      ativo: true,
    },
    create: {
      nome: "Voluntário Esperança Animal",
      email: volEmail,
      senhaHash: volSenhaHash,
      cargo: Role.VOLUNTARIO,
      whatsapp: "5527999990002",
      ativo: true,
    },
  });

  console.log(`✅ Voluntário configurado: ${voluntario.email}`);

  // 3. Cadastrar Animais de Demonstração para a Vitrine
  const animaisDemo = [
    {
      nome: "Thor",
      slug: "thor-vira-lata-caramelo-porte-medio",
      especie: Especie.CACHORRO,
      raca: "Vira-lata Caramelo",
      porte: Porte.MEDIO,
      sexo: Sexo.MACHO,
      idadeEstimadaMeses: 18,
      pesoKg: 14.5,
      castrado: true,
      vacinado: true,
      vermifugado: true,
      necessidadesEspeciais: false,
      descricaoSaude: "Saúde 100% em dia, vacinado com V10 e antirrábica.",
      temperamento: ["Dócil", "Brincalhão", "Sociável com outros cães"],
      exigeTelaProtecao: false,
      historia:
        "Thor foi resgatado em um dia de muita chuva em um canteiro de obras. Muito assustado no início, hoje ele é a alegria do abrigo. Adora correr no gramado, brincar com bolinhas e receber carinho na barriga.",
      status: StatusAnimal.DISPONIVEL,
      destaqueVitrine: true,
      fotoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800",
    },
    {
      nome: "Mia",
      slug: "mia-siames-drap-pequeno-porte",
      especie: Especie.GATO,
      raca: "Mestiça Siamês",
      porte: Porte.PEQUENO,
      sexo: Sexo.FEMEA,
      idadeEstimadaMeses: 10,
      pesoKg: 3.2,
      castrado: true,
      vacinado: true,
      vermifugado: true,
      necessidadesEspeciais: false,
      descricaoSaude: "Testada negativa para FIV/FeLV, vermifugada e castrada.",
      temperamento: ["Carinhosa", "Curiosa", "Adora colo"],
      exigeTelaProtecao: true, // EXIGE TELA: Regra para testar a pré-triagem!
      historia:
        "Mia foi encontrada abandonada em uma caixa de papelão ainda filhotinha. É uma gatinha extremamente meiga que ronrona ao menor toque e procura um lar tranquilo com janelas teladas para sua proteção.",
      status: StatusAnimal.DISPONIVEL,
      destaqueVitrine: true,
      fotoUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800",
    },
    {
      nome: "Pipoca",
      slug: "pipoca-femea-pequeno-porte-branca",
      especie: Especie.CACHORRO,
      raca: "SRD Porte Pequeno",
      porte: Porte.PEQUENO,
      sexo: Sexo.FEMEA,
      idadeEstimadaMeses: 24,
      pesoKg: 6.0,
      castrado: true,
      vacinado: true,
      vermifugado: true,
      necessidadesEspeciais: false,
      descricaoSaude: "Perfeita de saúde, cheia de energia e dentes limpinhos.",
      temperamento: ["Calma", "Companheira", "Se dá bem com crianças"],
      exigeTelaProtecao: false,
      historia:
        "Pipoca foi entregue por uma família que se mudou de estado e não pôde levá-la. É educada, faz suas necessidades no tapete higiênico e se adapta muito bem em apartamentos.",
      status: StatusAnimal.DISPONIVEL,
      destaqueVitrine: true,
      fotoUrl: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=800",
    },
    {
      nome: "Bob",
      slug: "bob-labrador-mesticado-porte-grande",
      especie: Especie.CACHORRO,
      raca: "Mestiço de Labrador",
      porte: Porte.GRANDE,
      sexo: Sexo.MACHO,
      idadeEstimadaMeses: 36,
      pesoKg: 24.0,
      castrado: true,
      vacinado: true,
      vermifugado: true,
      necessidadesEspeciais: false,
      descricaoSaude: "Castrado, vacinado e muito saudável.",
      temperamento: ["Leal", "Ativo", "Protetor"],
      exigeTelaProtecao: false,
      historia:
        "Bob é o cão mais carinhoso do abrigo. Um gigante gentil que adora passeios longos e companhia humana constante. Ideal para casas com quintal espaçoso.",
      status: StatusAnimal.DISPONIVEL,
      destaqueVitrine: false,
      fotoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800",
    },
  ];

  for (const a of animaisDemo) {
    const animal = await prisma.animal.upsert({
      where: { slug: a.slug },
      update: {
        status: a.status,
        destaqueVitrine: a.destaqueVitrine,
      },
      create: {
        nome: a.nome,
        slug: a.slug,
        especie: a.especie,
        raca: a.raca,
        porte: a.porte,
        sexo: a.sexo,
        idadeEstimadaMeses: a.idadeEstimadaMeses,
        pesoKg: a.pesoKg,
        castrado: a.castrado,
        vacinado: a.vacinado,
        vermifugado: a.vermifugado,
        necessidadesEspeciais: a.necessidadesEspeciais,
        descricaoSaude: a.descricaoSaude,
        temperamento: a.temperamento,
        exigeTelaProtecao: a.exigeTelaProtecao,
        historia: a.historia,
        status: a.status,
        destaqueVitrine: a.destaqueVitrine,
        fotos: {
          create: {
            url: a.fotoUrl,
            keyStorage: `demo/${a.slug}.jpg`,
            principal: true,
            ordem: 0,
          },
        },
      },
    });

    console.log(`🐾 Animal cadastrado na vitrine: ${animal.nome} (${animal.especie})`);
  }

  // 4. Cadastrar Solicitações de Demonstração para a Fase 5 (Backoffice de Adoções)
  const thor = await prisma.animal.findUnique({
    where: { slug: "thor-vira-lata-caramelo-porte-medio" },
  });

  if (thor) {
    await prisma.solicitacaoAdocao.upsert({
      where: { protocolo: "ADO-2026-9142" },
      update: {},
      create: {
        protocolo: "ADO-2026-9142",
        nomeAdotante: "Camila Fernandes de Oliveira",
        cpf: "12345678901",
        email: "camila.oliveira@exemplo.com",
        whatsapp: "5527998881234",
        dataNascimento: new Date("1996-05-14"),
        cep: "29060010",
        enderecoCompleto: "Rua das Palmeiras, 142, Apto 302",
        bairro: "Jardim da Penha",
        cidade: "Vitória",
        estado: "ES",
        aceitouTermosLGPD: true,
        tipoMoradia: TipoMoradia.APARTAMENTO_TELADO,
        imovelProprio: true,
        proprietarioPermite: true,
        todosConcordam: true,
        possuiOutrosAnimais: false,
        horasAnimalSozinho: 4,
        cienteCustosMensais: true,
        motivoAdocao:
          "Procuro um cão dócil para caminhadas diárias e companhia. Meu apartamento é telado e trabalho de home office.",
        scoreTriagem: 95,
        observacoesSistema:
          "Perfil de alta compatibilidade: Apartamento seguro e telado, tempo sozinho reduzido e total concordância familiar.",
        status: StatusAdocao.TRIAGEM_APROVADA,
        animalId: thor.id,
      },
    });

    console.log("📝 Solicitação de demonstração cadastrada: ADO-2026-9142 (Camila -> Thor)");
  }

  console.log("🚀 Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante a execução do seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
