const { config } = require('dotenv');
const { resolve } = require('path');
const { defineConfig } = require('drizzle-kit');

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../.env') });

module.exports = defineConfig({
  schema: './src/schema/index.ts',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});