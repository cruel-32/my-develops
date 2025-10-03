import { pgTable, uuid, bigint, varchar, jsonb } from 'drizzle-orm/pg-core';
import { erdCanvases } from './erd-canvases.schema';
import { nodeTypeEnum } from './enums';

export const erdNodes = pgTable('erd_nodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  canvasId: bigint('prj_id', { mode: 'number' }).references(() => erdCanvases.id, { onDelete: 'cascade' }),
  logicalName: varchar('logical_name', { length: 50 }),
  physicalName: varchar('physical_name', { length: 50 }),
  label: varchar('label', { length: 30 }),
  position: jsonb('position'),
  type: nodeTypeEnum('type'),
});
