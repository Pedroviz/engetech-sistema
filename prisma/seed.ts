import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth"; // Importa a função de hash do projeto

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  const hashedPassword = await hashPassword("123");

  // 1. Criar ou garantir o usuário Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@engetech.com.br" },
    update: { password: hashedPassword },
    create: {
      email: "admin@engetech.com.br",
      password: hashedPassword,
      name: "Administrador Engetech",
      role: "ADMIN",
    },
  });

  // 2. Criar ou garantir o usuário Demo
  await prisma.user.upsert({
    where: { email: "demo@engetech.com.br" },
    update: { password: hashedPassword },
    create: {
      email: "demo@engetech.com.br",
      password: hashedPassword,
      name: "Usuário Demo",
      role: "USER",
    },
  });

  console.log(
    `✅ Usuários criados/atualizados com sucesso. Admin ID: ${admin.id}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
