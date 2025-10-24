import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const SALT_ROUNDS = 10;

export async function signup(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const normalized = email.toLowerCase().trim();

    // check if exists
    const { rows: existing } = await pool.query('select id from public.users where lower(email) = $1', [normalized]);
    if (existing[0]) return res.status(409).json({ error: 'email already registered' });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
	const { rows } = await pool.query(
  `	INSERT INTO public.users (email, password)
   	VALUES ($1,$2)
  	 RETURNING id, email, created_at AS "createdAt"`,
       	[email, hash]
      );

    const user = rows[0];
    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (e) { next(e); }
}

export async function me(req, res, next) {
  try {
    // set by requireAuth in middleware/auth.js
    res.json({ user: { id: req.user.id, email: req.user.email } });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const normalized = email.toLowerCase().trim();
    const { rows } = await pool.query('select id, email, password from public.users where lower(email) = $1', [normalized]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email }, token });
  } catch (e) { next(e); }
}

