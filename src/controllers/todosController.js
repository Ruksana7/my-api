import * as Todo from '../models/todoModel.js';

export async function list(req, res, next) {
  try {
      const { page, limit, search, sort, order } = req.query;
      const data = await Todo.getTodos({ page, limit, search, userId: req.user.id, sort, order });
    res.json(data);
  } catch (e) { next(e); }
}

export async function get(req, res, next) {
  try {
    const todo = await Todo.getTodoById(Number(req.params.id), req.user.id);
    if (!todo) return res.status(404).json({ error: 'Not found' });
    res.json(todo);
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const { title, done, priority } = req.body || {};
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'title (string) is required' });
    }
    const todo = await Todo.createTodo({ title, done: !!done, priority, userId: req.user.id });
    res.status(201).json(todo);
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const { title, done, priority } = req.body || {};
    if (title !== undefined && typeof title !== 'string') {
      return res.status(400).json({ error: 'title must be string' });
    }
    if (done !== undefined && typeof done !== 'boolean') {
      return res.status(400).json({ error: 'done must be boolean' });
    }
    const todo = await Todo.updateTodo(Number(req.params.id), { title, done, priority, userId: req.user.id });
    if (!todo) return res.status(404).json({ error: 'Not found or not yours' });
    res.json(todo);
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    const todo = await Todo.deleteTodo(Number(req.params.id), req.user.id);
    if (!todo) return res.status(404).json({ error: 'Not found or not yours' });
    res.json(todo);
  } catch (e) { next(e); }
}

