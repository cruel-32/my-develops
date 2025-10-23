import { pgTable, bigserial, bigint } from 'drizzle-orm/pg-core';
import { diagramTypeEnum } from './enums';
import { users } from './users.schema';
import { canvases } from './canvases.schema';

export const diagramPosts = pgTable('diagram_posts', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  type: diagramTypeEnum('type').notNull(),
  userId: bigint('user_id', { mode: 'number' })
    .references(() => users.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  canvasId: bigint('canvas_id', { mode: 'number' })
    .references(() => canvases.id, { onDelete: 'cascade' })
    .notNull(),
});
