import { prisma } from '../src/config/database';

async function main() {
  await prisma.bid.deleteMany({});
  console.log('All bids deleted!');
}

main().finally(() => prisma.$disconnect()); 