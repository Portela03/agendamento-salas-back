const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.sala.findMany()
  .then(r => console.log(JSON.stringify(r, null, 2)))
  .catch(e => console.error('ERRO:', e.message))
  .finally(() => p.$disconnect());
