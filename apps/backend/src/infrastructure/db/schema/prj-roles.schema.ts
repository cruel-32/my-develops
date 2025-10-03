import { pgTable, bigint, primaryKey } from 'drizzle-orm/pg-core';
import { projects } from './projects.schema';
import { roles } from './roles.schema';

export const prjRoles = pgTable('prj_roles', {
  projectId: bigint('project_id', { mode: 'number' }).references(() => projects.id, { onDelete: 'cascade' }),
  roleId: bigint('role_id', { mode: 'number' }).references(() => roles.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.projectId, table.roleId] }),
  };
});
