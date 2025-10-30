import { pool } from '../db.js';

// list with pagination + filters
export async function listTodos(userId, { page=1, limit=10, q, done } = {}) {
  const offset = (page - 1) * limit;

  const wheres = ['user_id = $1'];
  const vals = [userId];
  let i = 2;

  if (typeof q === 'string' && q.trim()) {
    wheres.push(`title ILIKE $${i++}`);
    vals.push(`%${q.trim()}%`);
  }
  if (done !== undefined) {
    wheres.push(`done = $${i++}`);
    vals.push(done);
  }

  const whereSql = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*)::int AS total FROM public.todos ${whereSql}`;
  const { rows: countRows } = await pool.query(countSql, vals);
  const total = countRows[0]?.total ?? 0;

  const dataSql = `
    SELECT id, title, done, priority,
           created_at AS "createdAt", updated_at AS "updatedAt"
      FROM public.todos
      ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${i++} OFFSET $${i}
  `;
  const { rows } = await pool.query(dataSql, [...vals, limit, offset]);

  return { page, limit, total, items: rows };
}

// get single (scoped to user)
export async function getTodoById(userId, id) {
  const { rows } = await pool.query(
    `SELECT id, title, done, priority,
            created_at AS "createdAt", updated_at AS "updatedAt"
       FROM public.todos
      WHERE user_id = $1 AND id = $2
      LIMIT 1`,
    [userId, Number(id)]
  );
  return rows[0] || null;
}

// create
export async function createTodo(userId, { title, done=false, priority=1 }) {
  const id = Date.now();
  const { rows } = await pool.query(
    `INSERT INTO public.todos (id, user_id, title, done, priority)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, title, done, priority,
               created_at AS "createdAt", updated_at AS "updatedAt"`,
    [id, userId, title, !!done, Number(priority)]
  );
  return rows[0];
}

// update (partial)
export async function updateTodo(userId, id, { title, done, priority }) {
  const sets = [];
  const vals = [];
  let i = 1;

  if (title !== undefined)  { sets.push(`title = $${i++}`);    vals.push(title); }
  if (done  !== undefined)  { sets.push(`done = $${i++}`);     vals.push(done); }
  if (priority !== undefined) { sets.push(`priority = $${i++}`); vals.push(Number(priority)); }

  if (!sets.length) return null;

  vals.push(userId);
  vals.push(Number(id));

  const { rows } = await pool.query(
    `UPDATE public.todos
        SET ${sets.join(', ')}, updated_at = now()
      WHERE user_id = $${i++} AND id = $${i}
      RETURNING id, title, done, priority,
                created_at AS "createdAt", updated_at AS "updatedAt"`,
    vals
  );
  return rows[0] || null;
}

// delete
export async function deleteTodo(userId, id) {
  const { rows } = await pool.query(
    `DELETE FROM public.todos
      WHERE user_id = $1 AND id = $2
      RETURNING id, title, done, priority`,
    [userId, Number(id)]
  );
  return rows[0] || null;
}
