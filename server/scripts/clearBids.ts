import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.bid.deleteMany({});
  console.log('All bids deleted!');
}

main().finally(() => prisma.$disconnect()); 