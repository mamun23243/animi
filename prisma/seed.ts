import { PrismaClient } from "@prisma/client";
import { CHARACTERS } from "../lib/characters";

const prisma = new PrismaClient();

async function main() {
  for (const c of CHARACTERS) {
    await prisma.character.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }
  console.log(`✅ Seeded ${CHARACTERS.length} characters`);
}

main().finally(() => prisma.$disconnect());