import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senha = await bcrypt.hash("demo@2025", 12);

  await prisma.user.upsert({
    where: { email: "demo@engetech.com.br" },
    update: { password: senha },
    create: {
      email: "demo@engetech.com.br",
      name: "Usuário Demo",
      password: senha,
      role: "demo",
    },
  });

  console.log("✅ Usuário demo criado!");
  console.log("📧 Email: demo@engetech.com.br");
  console.log("🔑 Senha: demo@2025");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
