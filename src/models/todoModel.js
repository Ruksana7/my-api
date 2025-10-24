// src/models/todoModel.js
import { pool } from '../db.js';

/**
 * List todos for a specific user, with pagination + optional search.
 * @param {Object} opts
 * @param {number} opts.page
 * @param {number} opts.limit
 * @param {string} opts.search
 * @param {number} opts.userId  // REQUIRED (caller should pass req.user.id)
 */
export async function getTodos({ page = 1, limit = 10, search = '', userId, sort = 'created_at', order = 'desc' }) {
  if (userId == null) return { page, limit, total: 0, items: [] };

  const offset = (page - 1) * limit;

  let where = 'WHERE user_id = $1';
  const params = [userId];
  let next = 2;

  if (search) {
    where += ` AND lower(title) LIKE $${next++}`;
    params.push(`%${search.toLowerCase()}%`);
  }

  // ensure safe whitelist for sort/order
  const sortCol = sort === 'priority' ? 'priority' : 'created_at';
  const sortDir = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const countSql = `SELECT COUNT(*)::int AS total FROM public.todos ${where}`;
  const { rows: crow } = await pool.query(countSql, params);
  const total = crow[0]?.total ?? 0;

  const dataParams = [...params, limit, offset];
  const limitPos = next++;
  const offsetPos = next;

  const dataSql = `
    SELECT id, title, done, priority,
           created_at AS "createdAt",
           updated_at AS "updatedAt"
    FROM public.todos
    ${where}
    ORDER BY ${sortCol} ${sortDir}, id DESC
    LIMIT $${limitPos} OFFSET $${offsetPos}
  `;
  const { rows: items } = await pool.query(dataSql, dataParams);

  return { page, limit, total, items };
}

/**
 * Get a single todo by id that belongs to the user.
 */
export async function getTodoById(id, userId) {
  if (userId == null) return null;
  const { rows } = await pool.query(
      `SELECT id, title, done, priority,
             created_at AS "createdAt",
             updated_at AS "updatedAt"
          FROM public.todos
         WHERE id = $1 AND user_id = $2`
    [id, userId]
  );
  return rows[0] || null;
}

/**
 * Create a todo for the user.
 */
export async function createTodo({ title, done = false, userId, priority }) {
  if (userId == null) return null;
  const id = Date.now();

  const { rows } = await pool.query(
    `INSERT INTO public.todos (id, title, done, user_id, priority)
     VALUES ($1, $2, $3, $4, COALESCE($5, 2))
     RETURNING id, title, done, priority,
               created_at AS "createdAt",
               updated_at AS "updatedAt"`,
    [id, title, done, userId, priority ?? null]
  );
  return rows[0];
}

/**
 * Update a todo that belongs to the user (partial update).
 */
export async function updateTodo(id, { title, done, priority, userId }) {
  if (userId == null) return null;

  const sets = [];
  const vals = [];
  let i = 1;

  if (title !== undefined) { sets.push(`title = $${i++}`); vals.push(title); }
  if (done  !== undefined) { sets.push(`done  = $${i++}`); vals.push(done); }
  if (priority !== undefined) { sets.push(`priority = $${i++}`); vals.push(priority); }
  if (!sets.length) return null;

  vals.push(id, userId);

  const { rows } = await pool.query(
    `UPDATE public.todos
     SET ${sets.join(', ')}, updated_at = now()
     WHERE id = $${i++} AND user_id = $${i}
     RETURNING id, title, done, priority,
               created_at AS "createdAt",
               updated_at AS "updatedAt"`,
    vals
  );
  return rows[0] || null;
}

/**
 * Delete a todo that belongs to the user.
 */
export async function deleteTodo(id, userId) {
  if (userId == null) return null;
  const { rows } = await pool.query(
    `DELETE FROM public.todos
     WHERE id = $1 AND user_id = $2
     RETURNING id, title, done`,
    [id, userId]
  );
  return rows[0] || null;
}

