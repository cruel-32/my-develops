import { pgTable, bigint, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { roles } from './roles.schema';

export const operatorRoles = pgTable(
  'operator_roles',
  {
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id, {
      onDelete: 'cascade',
    }),
    roleId: bigint('role_id', { mode: 'number' }).references(() => roles.id, {
      onDelete: 'cascade',
    }),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.roleId] }),
    };
  }
);
