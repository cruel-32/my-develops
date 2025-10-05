import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../.env') });

import express from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './router';

const app = express();

app.use(cors());

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  }),
);

const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;
const host = process.env.HOST || '0.0.0.0';

const server = app.listen(port, host, () => {
  console.log(`Backend listening on http://${host}:${port}`);
});

server.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
