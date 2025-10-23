import swaggerJsdoc from 'swagger-jsdoc';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      description: 'API 문서',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: '인증 관련 API',
      },
      {
        name: 'Projects',
        description: '프로젝트 관리 API',
      },
      {
        name: 'Users',
        description: '사용자 관리 API',
      },
      {
        name: 'Operator Roles',
        description: '운영자 역할 관리 API',
      },
      {
        name: 'Images',
        description: '이미지 관리 API',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.ts'], // JSDoc 주석이 있는 파일들
};

const specs = swaggerJsdoc(options);
const outputFile = resolve('./src/swagger-output.json');
writeFileSync(outputFile, JSON.stringify(specs, null, 2));
console.log('Swagger documentation generated successfully!');
// swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
//   // eslint-disable-next-line @typescript-eslint/no-require-imports
//   require('./server.ts');
// });
