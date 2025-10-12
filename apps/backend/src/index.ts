import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter, createContext } from '@repo/api';
import { initializeDatabase } from '@repo/db';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../.env') });

async function startServer() {
  // 데이터베이스 초기화
  await initializeDatabase();

  const app = express();

  // CORS 설정
  app.use(
    cors({
      origin: process.env.NEXT_INTERNAL_APP_URL || 'http://localhost:3000',
      credentials: true,
    })
  );

  // tRPC 미들웨어 설정
  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
