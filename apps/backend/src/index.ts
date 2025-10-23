import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger-output.json';

import { appRouter } from '@/be/router';
import { initializeDatabase } from '@/be/db/initialize';
import { errorHandler } from '@/be/middlewares/errorHandler';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../.env') });

async function startServer() {
  // 데이터베이스 초기화
  await initializeDatabase();

  const app = express();

  // JSON 파싱 미들웨어
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS 설정
  app.use(
    cors({
      origin: process.env.NEXT_INTERNAL_APP_URL || 'http://localhost:3000',
      credentials: true,
    })
  );

  app.use('/api', appRouter);

  // development 환경에서만 swagger 문서를 생성하고 표시
  if (process.env.NODE_ENV === 'development') {
    app.use(
      '/docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, { explorer: true })
    );
  }

  // 에러 핸들러는 모든 라우트 이후에 추가
  app.use(errorHandler);

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
