import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { db } from '@/infrastructure/db/connection';
import { users } from '@/infrastructure/db/schema';

const t = initTRPC.create();

export const appRouter = t.router({
  getUser: t.procedure.input(z.string()).query(async (opts) => {
    // Example using the database package
    // const usersList = await db.select().from(users);
    return { id: opts.input, name: 'Bilbo' };
  }),
  // createUser: t.procedure.input(usersSchema.CreateUserSchema).mutation(async (opts) => {
  //   // Example using the database package
  //   // const newUser = await db.insert(users).values(opts.input).returning();
  //   return { id: 1, ...opts.input };
  // }),
});

export type AppRouter = typeof appRouter;
