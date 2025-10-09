import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../../.env') });

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
const db = drizzle({ client: pool });

async function main() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  console.log('Migrations completed!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
