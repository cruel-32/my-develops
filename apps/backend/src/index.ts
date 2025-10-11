import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../.env') });

import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter, createContext } from '@repo/api';
import { initializeDatabase } from '@repo/db';

async function startServer() {
  // 데이터베이스 초기화
  await initializeDatabase();

  const server = createHTTPServer({
    router: appRouter,
    createContext, // 서버에 context 생성 함수 제공
    // ✅ CORS 설정 - Cookie 전달을 위해 credentials 허용
    middleware(req, res, next: () => void) {
      const origin = req.headers.origin || 'http://localhost:3000';

      // CORS 헤더 설정
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Cookie'
      );
      res.setHeader('Access-Control-Allow-Credentials', 'true'); // ✅ Cookie 허용

      // Preflight 요청 처리
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      next();
    },
  });

  const port = process.env.PORT || 4000;
  server.listen(port);
  console.log(`🚀 Server listening on port ${port}`);
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
