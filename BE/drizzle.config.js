import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/models/schema.js',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './db.sqlite',
  },
});
