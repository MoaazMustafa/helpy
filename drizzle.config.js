// Drizzle Kit config — generates SQL migrations from schemas under src/db/schema.
// Run with: npm run db:generate
/** @type {import('drizzle-kit').Config} */
module.exports = {
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  driver: 'expo',
};
