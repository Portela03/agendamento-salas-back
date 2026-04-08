import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

/**
 * Singleton PrismaClient using the @prisma/adapter-pg driver adapter (Prisma 7+).
 * The connection URL is passed here at runtime; the schema.prisma datasource
 * block no longer holds the URL (that responsibility moved to prisma.config.ts
 * for CLI tools and to this adapter for the application runtime).
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prismaClient = new PrismaClient({ adapter });

export { prismaClient };
