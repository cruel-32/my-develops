import { pgTable, bigserial, varchar, boolean } from 'drizzle-orm/pg-core';

export const roles = pgTable('roles', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  roleName: varchar('role_name', { length: 50 }),
  roleDesc: varchar('role_desc', { length: 255 }),
  enabled: boolean('enabled').default(true),
});
