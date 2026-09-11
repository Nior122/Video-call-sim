import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.persona.deleteMany({});
  console.log("Deleted all personas");
}
main().catch(console.error).finally(() => prisma.$disconnect());
