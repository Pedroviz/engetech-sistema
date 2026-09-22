import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({
    where: { email: "admin@engetech.com.br" },
  });
  const demo = await prisma.user.findUnique({
    where: { email: "demo@engetech.com.br" },
  });

  if (!admin) {
    console.log("❌ Admin não encontrado");
    return;
  }
  if (!demo) {
    console.log("❌ Demo não encontrado");
    return;
  }

  console.log(`✅ Admin ID: ${admin.id}`);
  console.log(`✅ Demo  ID: ${demo.id}`);

  // Usar SQL puro para atualizar — sem depender dos tipos do Prisma
  const tabelas = [
    "Cliente",
    "Obra",
    "Fornecedor",
    "Orcamento",
    "Diarista",
    "Material",
    "GastoEsporadico",
    "Lancamento",
    "RDO",
  ];

  for (const tabela of tabelas) {
    const result = await prisma.$executeRawUnsafe(
      `UPDATE "${tabela}" SET "tenantId" = $1 WHERE "tenantId" IS NULL OR "tenantId" = ''`,
      admin.id,
    );
    console.log(`✅ ${tabela}: ${result} registro(s) migrado(s) para o Admin`);
  }

  // Verificar
  const obrasAdmin = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*) as count FROM "Obra" WHERE "tenantId" = $1`,
    admin.id,
  );
  const obrasDemo = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*) as count FROM "Obra" WHERE "tenantId" = $1`,
    demo.id,
  );

  console.log(`\n📊 Admin possui: ${obrasAdmin[0]?.count} obras`);
  console.log(`📊 Demo  possui: ${obrasDemo[0]?.count} obras`);
  console.log("\n🎉 Separação concluída!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
