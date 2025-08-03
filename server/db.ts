
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  statement_timeout: 10000
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // No cerramos el pool aquí, solo registramos el error
});

pool.on('connect', () => {
  console.log('Database connected successfully');
});

export const db = drizzle(pool, { schema });
