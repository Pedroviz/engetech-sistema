import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Criar ou garantir o usuário Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@engetech.com.br" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@engetech.com.br",
      password: "123", // Senha padrão para testes locais
    },
  });

  // 2. Criar ou garantir o usuário Demo
  await prisma.user.upsert({
    where: { email: "demo@engetech.com.br" },
    update: {},
    create: {
      name: "Demo",
      email: "demo@engetech.com.br",
      password: "123",
    },
  });

  console.log(`✅ Usuários garantidos. Admin ID: ${admin.id}`);

  // 3. Criar um cliente de exemplo vinculado ao tenant do admin
  const cliente = await prisma.cliente.create({
    data: {
      tenantId: admin.id,
      nome: "Família Rodrigues",
      segmento: "Residencial",
      whatsapp: "(11) 99999-9999",
      email: "contato@rodrigues.com",
      classificacao: "A",
      observacoes: "Cliente de teste local",
    },
  });

  // 4. Criar uma obra de exemplo vinculada ao tenant e ao cliente
  await prisma.obra.create({
    data: {
      tenantId: admin.id,
      centroCusto: "CC-001",
      clienteId: cliente.id,
      tipo: "residencial",
      status: "andamento",
      inicio: new Date(),
      previsaoFim: new Date("2026-12-31"),
      contrato: 150000,
      orcamentoMat: 50000,
      orcamentoMO: 40000,
    },
  });

  console.log("✅ Seed executado com sucesso! Dados de teste criados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
