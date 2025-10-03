import { pgTable, bigserial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: varchar('email', { length: 50 }),
  name: varchar('name', { length: 50 }),
  picture: varchar('picture', { length: 50 }),
  createdAt: timestamp('create_at').defaultNow(),
  updatedAt: timestamp('update_at').defaultNow(),
});
