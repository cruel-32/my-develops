import { pgTable, uuid, bigint, varchar, jsonb } from 'drizzle-orm/pg-core';
import { erdCanvases } from './erd-canvases.schema';
import { nodeTypeEnum } from './enums';

export const erdNodes = pgTable('erd_nodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  canvasId: bigint('prj_id', { mode: 'number' })
    .references(() => erdCanvases.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  logicalName: varchar('logical_name', { length: 50 }).notNull(),
  physicalName: varchar('physical_name', { length: 50 }).notNull(),
  label: varchar('label', { length: 30 }).notNull(),
  position: jsonb('position'),
  type: nodeTypeEnum('type').notNull(),
});
