import { db } from '../db/connection';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'projects';
    `);
    console.log('Columns in projects table:', result.rows.map(r => r.column_name));
  } catch (error) {
    console.error('Error checking columns:', error);
  }
  process.exit(0);
}

main();
