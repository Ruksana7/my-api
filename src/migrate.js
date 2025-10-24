// src/migrate.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        run_at TIMESTAMP DEFAULT now()
      );
    `);

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const applied = await client.query('SELECT 1 FROM public.migrations WHERE filename=$1', [file]);
      if (applied.rowCount) continue;
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`▶ running migration: ${file}`);
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO public.migrations(filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`✔ done: ${file}`);
    }
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();

