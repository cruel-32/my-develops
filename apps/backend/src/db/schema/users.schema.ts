import {
  pgTable,
  bigserial,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 100 }),
  password_hash: varchar('password_hash', { length: 255 }),
  refresh_token: varchar('refresh_token', { length: 500 }),
  is_verified: boolean('is_verified').default(false),
  picture: varchar('picture', { length: 500 }),
  createdAt: timestamp('create_at').defaultNow(),
  updatedAt: timestamp('update_at').defaultNow(),
});
