import {
  pgTable,
  bigserial,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  refresh_token: varchar('refresh_token', { length: 500 }),
  is_verified: boolean('is_verified').default(false).notNull(),
  picture: varchar('picture', { length: 500 }),
  createdAt: timestamp('create_at').defaultNow().notNull(),
  updatedAt: timestamp('update_at').defaultNow().notNull(),
});
