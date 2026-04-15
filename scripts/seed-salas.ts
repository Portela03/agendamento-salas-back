import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const salas = [
  { nome: 'Sala 101' },
  { nome: 'Sala 102' },
  { nome: 'Sala 103' },
  { nome: 'Sala 201' },
  { nome: 'Sala 202' },
  { nome: 'Sala 301' },
  { nome: 'Sala 302' },
  { nome: 'Lab de Informática 1' },
  { nome: 'Lab de Informática 2' },
  { nome: 'Auditório' },
];

async function main() {
  console.log('Criando salas de exemplo...');

  for (const sala of salas) {
    const exists = await prisma.sala.findFirst({ where: { nome: sala.nome } });
    if (!exists) {
      const created = await prisma.sala.create({ data: sala });
      console.log(`  ✅ Criada: ${created.nome} (${created.id})`);
    } else {
      console.log(`  ⏩ Já existe: ${sala.nome}`);
    }
  }

  console.log('\nSeed concluído!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
