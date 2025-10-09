import { config } from 'dotenv';
import { resolve } from 'path';
import { defineConfig } from 'drizzle-kit';

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../.env') });

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
