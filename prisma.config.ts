import 'dotenv/config';
import { defineConfig, env, type PrismaConfig } from 'prisma/config';

/**
 * prisma.config.ts — used by Prisma CLI (migrate, studio, etc.) in Prisma 7+.
 * The datasource URL is no longer declared in schema.prisma; it lives here.
 */
const prismaConfig: PrismaConfig = {
  datasource: {
    url: env('DATABASE_URL'),
  },
};

export default defineConfig(prismaConfig);
