import { z, ZodError } from 'zod';
import {
  listTodos as listTodosModel,
  getTodoById,
  createTodo as createTodoModel,
  updateTodo as updateTodoModel,
  deleteTodo as deleteTodoModel
} from '../models/todoModel.js';

// shared guard so we don't crash on req.user.id
function ensureUser(req, res) {
  const user = req.user;
  if (!user || !user.id) {
    res.status(401).json({ error: 'unauthorized' });
    return null;
  }
  return user;
}

// schemas (only used if we call parse here)
const createBodySchema = z.object({
  title: z.string().min(1, 'title (string) is required'),
  done: z.boolean().optional(),
  priority: z.coerce.number().int().min(1).max(3).optional()
});

const patchBodySchema = z.object({
  title: z.string().min(1).optional(),
  done: z.boolean().optional(),
  priority: z.coerce.number().int().min(1).max(3).optional()
}).refine(o => Object.keys(o).length > 0, { message: 'at least one field required' });

export async function listTodos(req, res, next) {
  try {
    const user = ensureUser(req, res);
    if (!user) return;
    const userId = user.id;

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const q = req.query.q;
    const done =
      req.query.done === 'true'
        ? true
        : req.query.done === 'false'
        ? false
        : undefined;

    const result = await listTodosModel(userId, { page, limit, q, done });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function showTodo(req, res, next) {
  try {
    const user = ensureUser(req, res);
    if (!user) return;
    const userId = user.id;
    const { id } = req.params;

    const todo = await getTodoById(userId, id);
    if (!todo) return res.status(404).json({ error: 'not found' });
    res.json(todo);
  } catch (err) {
    next(err);
  }
}

export async function createTodo(req, res, next) {
  try {
    const user = ensureUser(req, res);
    if (!user) return;
    const userId = user.id;

    let data;
    try {
      data = createBodySchema.parse(req.body ?? {});
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: 'invalid input',
          details: err.errors?.map(e => e.message) ?? []
        });
      }
      throw err;
    }

    const todo = await createTodoModel(userId, data);
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
}

export async function updateTodo(req, res, next) {
  try {
    const user = ensureUser(req, res);
    if (!user) return;
    const userId = user.id;
    const { id } = req.params;

    let data;
    try {
      data = patchBodySchema.parse(req.body ?? {});
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: 'invalid input',
          details: err.errors?.map(e => e.message) ?? []
        });
      }
      throw err;
    }

    const todo = await updateTodoModel(userId, id, data);
    if (!todo) return res.status(404).json({ error: 'not found' });
    res.json(todo);
  } catch (err) {
    next(err);
  }
}

export async function deleteTodo(req, res, next) {
  try {
    const user = ensureUser(req, res);
    if (!user) return;
    const userId = user.id;
    const { id } = req.params;

    const removed = await deleteTodoModel(userId, id);
    if (!removed) return res.status(404).json({ error: 'not found' });
    res.json(removed);
  } catch (err) {
    next(err);
  }
}
