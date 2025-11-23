import {
  pgTable,
  uuid,
  bigint,
  varchar,
  timestamp,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { projects } from './projects.schema';

export const images = pgTable('images', {
  id: uuid('id').primaryKey().defaultRandom(),
  prjId: bigint('prj_id', { mode: 'number' })
    .references((): AnyPgColumn => projects.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  imgUrl: varchar('img_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
