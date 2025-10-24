import { defineConfig } from '@kubb/core';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginReactQuery } from '@kubb/plugin-react-query';
import { pluginTs } from '@kubb/plugin-ts';
import { pluginClient } from '@kubb/plugin-client';
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
      validate: false,
    }),
    pluginTs(),
    pluginZod(),
    pluginClient({
      client: 'fetch',
    }),
    pluginReactQuery({
      client: {
        importPath: '@kubb/plugin-client/clients/fetch',
      },
      infinite: {
        queryParam: 'page',
        initialPageParam: 0,
      },
    }),
  ],
});
