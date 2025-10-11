import { pgTable, uuid, bigint, integer, varchar } from 'drizzle-orm/pg-core';
import { erdNodes } from './erd-nodes.schema';
import { erdCanvases } from './erd-canvases.schema';

export const nodeFields = pgTable('node_fields', {
  id: uuid('id').defaultRandom().primaryKey(),
  nodeId: uuid('node_id').references(() => erdNodes.id, {
    onDelete: 'cascade',
  }),
  canvasId: bigint('prj_id', { mode: 'number' }).references(
    () => erdCanvases.id,
    { onDelete: 'cascade' }
  ),
  index: integer('index'),
  logicalName: varchar('logical_name', { length: 50 }),
  physicalName: varchar('physical_name', { length: 50 }),
});
