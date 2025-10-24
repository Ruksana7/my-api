import express from 'express';
import * as c from '../controllers/todosController.js';
import { requireAuth } from '../middleware/auth.js';
import {
  validateBody, validateQuery,
  createTodoSchema, updateTodoSchema, listQuerySchema
} from '../middleware/validate.js';

const router = express.Router();

// all todos routes require auth (user-owned)
router.use(requireAuth);

// list with validated query (?page=&limit=&search=)
router.get('/', validateQuery(listQuerySchema), c.list);

// get one (no body, no query validation needed)
router.get('/:id', c.get);

// create / update / delete with body validation
router.post('/', validateBody(createTodoSchema), c.create);
router.patch('/:id', validateBody(updateTodoSchema), c.update);
router.delete('/:id', c.remove);

export default router;

