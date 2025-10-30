import { z } from 'zod';
import {
  listTodos as listTodosModel,
  getTodoById,
  createTodo as createTodoModel,
  updateTodo as updateTodoModel,
  deleteTodo as deleteTodoModel
} from '../models/todoModel.js';

const createBodySchema = z.object({
  title: z.string().min(1, 'title (string) is required'),
  done: z.boolean().optional(),
  priority: z.coerce.number().int().min(1).max(3).optional()
});

const patchBodySchema = z.object({
  title: z.string().min(1).optional(),
  done: z.boolean().optional(),
  priority: z.coerce.number().int().min(1).max(3).optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'at least one field required' });

export async function listTodos(req, res, next) {
  try {
    const userId = req.user.id;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const q = req.query.q;
    const done = req.query.done === 'true' ? true : req.query.done === 'false' ? false : undefined;

    const result = await listTodosModel(userId, { page, limit, q, done });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function showTodo(req, res, next) {
  try {
    const userId = req.user.id;
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
    const userId = req.user.id;
    const body = createBodySchema.parse(req.body ?? {});
    const todo = await createTodoModel(userId, body);
    res.status(201).json(todo);
  } catch (err) {
    if (err?.issues) return res.status(400).json({ error: 'invalid input', details: err.issues.map(x=>x.message) });
    next(err);
  }
}

export async function updateTodo(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const body = patchBodySchema.parse(req.body ?? {});
    const todo = await updateTodoModel(userId, id, body);
    if (!todo) return res.status(404).json({ error: 'not found' });
    res.json(todo);
  } catch (err) {
    if (err?.issues) return res.status(400).json({ error: 'invalid input', details: err.issues.map(x=>x.message) });
    next(err);
  }
}

export async function deleteTodo(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const removed = await deleteTodoModel(userId, id);
    if (!removed) return res.status(404).json({ error: 'not found' });
    res.json(removed);
  } catch (err) {
    next(err);
  }
}
