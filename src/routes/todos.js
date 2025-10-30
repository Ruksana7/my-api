import express from 'express';
import { z } from 'zod';
import { zodValidate } from '../middleware/zodValidate.js';
import {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  showTodo
} from '../controllers/todosController.js';

const router = express.Router();

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'id must be a numeric string'),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().optional(),
  done: z.enum(['true','false']).optional()
});

// Order matters: '/' before '/:id'
router.get('/', zodValidate({ query: listQuerySchema }), listTodos);
router.post('/', createTodo);
router.patch('/:id', zodValidate({ params: idParamSchema }), updateTodo);
router.delete('/:id', zodValidate({ params: idParamSchema }), deleteTodo);
router.get('/:id', zodValidate({ params: idParamSchema }), showTodo);

export default router;
