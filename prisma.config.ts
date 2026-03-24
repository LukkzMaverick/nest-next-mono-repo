import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'apps/backend/prisma/schema.prisma',
  migrations: {
    path: 'apps/backend/prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});