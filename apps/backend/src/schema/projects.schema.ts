import {
  pgTable,
  bigserial,
  varchar,
  boolean,
  bigint,
  uuid,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { images } from './images.schema';

export const projects = pgTable('projects', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  public: boolean('public').default(true).notNull(),
  ownerId: bigint('owner_id', { mode: 'number' })
    .references((): AnyPgColumn => users.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  imgId: uuid('img_id').references((): AnyPgColumn => images.id, {
    onDelete: 'cascade',
  }),
  imgUrl: varchar('img_url', { length: 255 }),
});
