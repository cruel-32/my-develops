import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../.env') });

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
export const db = drizzle({ client: pool, schema });
