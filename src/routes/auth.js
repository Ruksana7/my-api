import express from 'express';
import { signup, login, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, signupSchema, loginSchema } from '../middleware/validate.js';

const router = express.Router();

router.post('/signup', validateBody(signupSchema), signup);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', requireAuth, me);

export default router;


