// src/middleware/validate.js
import { z } from 'zod';

/** Helpers */
function formatZodError(err) {
  const issues = err?.issues ?? err?.errors ?? [];
  if (!Array.isArray(issues) || issues.length === 0) return 'invalid request';
  return issues.map(i => i.message).join(', ');
}

/** Body Schemas */
export const createTodoSchema = z.object({
  title: z.string().min(1, 'title required'),
  done: z.boolean().optional(),
  // accepts "1"/"2"/"3" or 1/2/3
  priority: z.coerce.number().int().min(1, { message: 'priority must be 1, 2, or 3' })
                         .max(3, { message: 'priority must be 1, 2, or 3' })
                         .optional()
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  done: z.boolean().optional(),
  priority: z.coerce.number().int().min(1, { message: 'priority must be 1, 2, or 3' })
                         .max(3, { message: 'priority must be 1, 2, or 3' })
                         .optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'no fields to update' });

/** Auth Schemas */
export const signupSchema = z.object({
  email: z.string().email('invalid email'),
  password: z.string().min(6, 'password must be at least 6 chars')
});

export const loginSchema = z.object({
  email: z.string().email('invalid email'),
  password: z.string().min(1, 'password required')
});

/** Query Schema */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional().default(''),
  sort: z.enum(['created_at', 'priority']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
});

/** Middleware */
export function validateBody(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: formatZodError(parsed.error) });
      }
      req.body = parsed.data;
      next();
    } catch (e) { next(e); }
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: formatZodError(parsed.error) });
      }
      // Express 5: req.query is a getter; merge instead of replace
      Object.assign(req.query, parsed.data);
      next();
    } catch (e) { next(e); }
  };
}

