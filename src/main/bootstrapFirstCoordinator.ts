import { hash } from 'bcrypt';
import { prismaClient } from '../infrastructure/database/prisma/prismaClient';

export async function bootstrapFirstCoordinator(): Promise<void> {
  const usersCount = await prismaClient.user.count();

  if (usersCount > 0) {
    return;
  }

  const name = process.env.FIRST_COORDINATOR_NAME ?? 'Coordenador Admin';
  const email = process.env.FIRST_COORDINATOR_EMAIL ?? 'coordenador@fatec.sp.gov.br';
  const password = process.env.FIRST_COORDINATOR_PASSWORD ?? 'admin123';

  const passwordHash = await hash(password, 12);

  await prismaClient.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role: 'COORDENADOR',
      status: 'APROVADO',
      approvedAt: new Date(),
    },
  });

  console.log(`[bootstrap] Coordenador inicial criado: ${email}`);
}
