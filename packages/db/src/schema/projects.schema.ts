import {
  pgTable,
  bigserial,
  varchar,
  boolean,
  bigint,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const projects = pgTable('projects', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  public: boolean('public').default(true).notNull(),
  ownerId: bigint('owner_id', { mode: 'number' })
    .references(() => users.id, {
      onDelete: 'cascade',
    })
    .notNull(),
});
