kcat > src/routes/todos.js <<'EOF'
import express from 'express';
import {
  listTodos,
  showTodo,
  createTodo,
  updateTodo,
  deleteTodo
} from '../controllers/todosController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// All todos routes require a valid JWT
router.use(requireAuth);

router.get('/', listTodos);
router.get('/:id', showTodo);
router.post('/', createTodo);
router.patch('/:id', updateTodo);
router.delete('/:id', deleteTodo);

export default router;


