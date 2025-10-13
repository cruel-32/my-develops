import {
  pgTable,
  bigserial,
  varchar,
  boolean,
  bigint,
} from 'drizzle-orm/pg-core';
import { projects } from './projects.schema';
import { roleTypeEnum } from './enums';

export const roles = pgTable('roles', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  roleName: roleTypeEnum('role_name').notNull(),
  roleDesc: varchar('role_desc', { length: 255 }).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  prjId: bigint('prj_id', { mode: 'number' }).references(() => projects.id, {
    onDelete: 'cascade',
  }),
});
