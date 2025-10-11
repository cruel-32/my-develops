import { pgEnum } from 'drizzle-orm/pg-core';

export const nodeTypeEnum = pgEnum('node_type', ['databaseSchema']);
export const diagramTypeEnum = pgEnum('diagram_type', [
  'activity',
  'sequence',
  'class',
  'state',
]);
