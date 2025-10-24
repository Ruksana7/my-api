import { pool } from '../src/db.js';
import app from '../src/app.js';
import supertest from 'supertest';

process.env.NODE_ENV = 'test';
global.request = supertest(app);

global.resetDb = async () => {
  await pool.query('DELETE FROM public.todos;');
  await pool.query('DELETE FROM public.users;');
};

afterAll(async () => {
  await pool.end();
});
