import { defineConfig } from '@kubb/core';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginReactQuery } from '@kubb/plugin-react-query';
import { pluginTs } from '@kubb/plugin-ts';
import { pluginZod } from '@kubb/plugin-zod';

export default defineConfig({
  input: {
    path: './apps/backend/src/swagger-output.json',
  },
  output: {
    path: './packages/api/src/generated',
    clean: true,
  },
  plugins: [
    pluginOas({
      // openapi 스펙을 검증하는 플러그인
      validate: true,
    }),
    pluginTs(), // typescript 타입을 자동 생성하는 플러그인
    pluginZod(), // zod 스키마를 자동 생성하는 플러그인
    pluginReactQuery({
      // react query hook을 자동 생성하는 플러그인
      output: {
        path: './hooks',
      },
      group: {
        type: 'tag',
        name: ({ group }) => `${group}Hooks`,
      },
      client: {
        importPath: '@repo/api/client',
        dataReturnType: 'full',
      },
      mutation: {
        methods: ['post', 'put', 'delete'],
      },
      query: {
        methods: ['get'],
        importPath: '@tanstack/react-query',
      },
      infinite: {
        queryParam: 'page',
        initialPageParam: 0,
      },
      suspense: {},
    }),
  ],
});
