import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const salas = [
  // ── Salas de aula ─────────────────────────────────────────────────────────
  { name: 'Sala A-01',  capacity: 40, type: 'SALA' as const, description: 'Bloco A – 1º andar' },
  { name: 'Sala A-02',  capacity: 40, type: 'SALA' as const, description: 'Bloco A – 1º andar' },
  { name: 'Sala A-03',  capacity: 40, type: 'SALA' as const, description: 'Bloco A – 1º andar' },
  { name: 'Sala A-04',  capacity: 40, type: 'SALA' as const, description: 'Bloco A – 1º andar' },
  { name: 'Sala A-05',  capacity: 40, type: 'SALA' as const, description: 'Bloco A – 1º andar' },
  { name: 'Sala B-01',  capacity: 45, type: 'SALA' as const, description: 'Bloco B – 1º andar' },
  { name: 'Sala B-02',  capacity: 45, type: 'SALA' as const, description: 'Bloco B – 1º andar' },
  { name: 'Sala B-03',  capacity: 45, type: 'SALA' as const, description: 'Bloco B – 1º andar' },
  { name: 'Sala B-04',  capacity: 45, type: 'SALA' as const, description: 'Bloco B – 1º andar' },
  { name: 'Sala C-01',  capacity: 35, type: 'SALA' as const, description: 'Bloco C – térreo'   },
  { name: 'Sala C-02',  capacity: 35, type: 'SALA' as const, description: 'Bloco C – térreo'   },
  { name: 'Sala C-03',  capacity: 35, type: 'SALA' as const, description: 'Bloco C – térreo'   },
  { name: 'Sala D-01',  capacity: 50, type: 'SALA' as const, description: 'Bloco D – 2º andar' },
  { name: 'Sala D-02',  capacity: 50, type: 'SALA' as const, description: 'Bloco D – 2º andar' },
  { name: 'Sala D-03',  capacity: 50, type: 'SALA' as const, description: 'Bloco D – 2º andar' },

  // ── Laboratórios de Informática ────────────────────────────────────────────
  { name: 'Lab Informática 1', capacity: 30, type: 'LABORATORIO' as const, description: 'Windows 11 · 30 estações Dell' },
  { name: 'Lab Informática 2', capacity: 30, type: 'LABORATORIO' as const, description: 'Windows 11 · 30 estações Dell' },
  { name: 'Lab Informática 3', capacity: 30, type: 'LABORATORIO' as const, description: 'Linux · 30 estações HP'       },
  { name: 'Lab Redes',         capacity: 20, type: 'LABORATORIO' as const, description: 'Equipamentos Cisco/Mikrotik'   },

  // ── Laboratórios especializados ────────────────────────────────────────────
  { name: 'Lab Eletrônica',    capacity: 25, type: 'LABORATORIO' as const, description: 'Bancadas com equipamentos de medição' },
  { name: 'Lab Mecânica',      capacity: 20, type: 'LABORATORIO' as const, description: 'Ferramentas e bancadas de trabalho'   },
  { name: 'Lab Química',       capacity: 25, type: 'LABORATORIO' as const, description: 'Vidraria e reagentes disponíveis'     },
  { name: 'Lab Multimídia',    capacity: 30, type: 'LABORATORIO' as const, description: 'Câmeras, iluminação e ilha de edição' },

  // ── Auditórios e espaços especiais ────────────────────────────────────────
  { name: 'Auditório Principal', capacity: 200, type: 'AUDITORIO' as const, description: 'Palco, datashow, sistema de som'  },
  { name: 'Auditório Secundário',capacity: 80,  type: 'AUDITORIO' as const, description: 'Datashow e microfone sem fio'     },
  { name: 'Sala de Reuniões',    capacity: 20,  type: 'AUDITORIO' as const, description: 'TV 65", videoconferência'         },
];

async function main() {
  console.log(`\n🏫  Seed de salas — FATEC Zona Leste`);
  console.log(`─────────────────────────────────────`);

  let criadas = 0;
  let existentes = 0;

  for (const sala of salas) {
    const exists = await prisma.class.findFirst({ where: { name: sala.name } });
    if (!exists) {
      const created = await prisma.class.create({ data: sala });
      console.log(`  ✅  ${created.type.padEnd(11)} │ ${created.name.padEnd(24)} │ ${created.capacity} lugares`);
      criadas++;
    } else {
      console.log(`  ⏩  (já existe)    │ ${sala.name}`);
      existentes++;
    }
  }

  console.log(`─────────────────────────────────────`);
  console.log(`  ${criadas} sala(s) criada(s), ${existentes} já existia(m).\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
