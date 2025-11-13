import express from 'express';
import {
  listTodos,
  showTodo,
  createTodo,
  updateTodo,
  deleteTodo
} from '../controllers/todosController.js';

const router = express.Router();

router.get('/', listTodos);
router.get('/:id', showTodo);
router.post('/', createTodo);
router.patch('/:id', updateTodo);
router.delete('/:id', deleteTodo);

export default router;
