import { pgTable, bigserial, bigint } from 'drizzle-orm/pg-core';
import { projects } from './projects.schema';

export const canvases = pgTable('canvases', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  prjId: bigint('prj_id', { mode: 'number' }).references(() => projects.id, { onDelete: 'cascade' }),
});
