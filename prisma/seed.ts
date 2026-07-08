import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Criar usuário admin
  const senhaHash = await bcrypt.hash("engetech2025", 12);

  await prisma.user.upsert({
    where: { email: "admin@engetech.com.br" },
    update: {},
    create: {
      email: "admin@engetech.com.br",
      name: "Administrador",
      password: senhaHash,
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin2@engetech.com.br" },
    update: {},
    create: {
      email: "admin2@engetech.com.br",
      name: "Administrativo",
      password: senhaHash,
      role: "admin",
    },
  });

  // Criar cliente de exemplo
  const cliente = await prisma.cliente.upsert({
    where: { id: "cliente-001" },
    update: {},
    create: {
      id: "cliente-001",
      nome: "Família Rodrigues",
      segmento: "residencial",
      whatsapp: "(85) 99999-1234",
      email: "rodrigues@email.com",
      classificacao: "fidelizado",
      clienteDesde: "2019",
      observacoes: "Reforma anual todo janeiro",
    },
  });

  // Criar obra de exemplo
  await prisma.obra.upsert({
    where: { centroCusto: "CC-001" },
    update: {},
    create: {
      centroCusto: "CC-001",
      clienteId: cliente.id,
      tipo: "residencial",
      status: "execucao",
      inicio: new Date("2025-01-10"),
      previsaoFim: new Date("2025-04-30"),
      contrato: 48000,
      orcamentoMat: 22000,
      orcamentoMO: 9600,
      gastoMat: 18200,
      gastoMO: 7400,
      gastoEsporadico: 2800,
    },
  });

  console.log("✅ Seed concluído!");
  console.log("📧 Admin: admin@engetech.com.br");
  console.log("🔑 Senha: engetech2025");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
