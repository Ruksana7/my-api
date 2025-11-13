// src/app.js
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { readFile } from 'fs/promises';
import yaml from 'yaml';
import requireAuth from './middleware/requireAuth.js';
import authRouter from './routes/auth.js';
import todosRouter from './routes/todos.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: [/^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/],
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json({ limit: '200kb' }));
app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'dev'));

if (process.env.NODE_ENV !== 'test') {
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, try again later' }
});
app.use('/auth', authLimiter);
}
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
  });
});
app.use('/auth', authRouter);
app.use('/api/todos', requireAuth, todosRouter);
const openapiText = await readFile(new URL('../docs/openapi.yaml', import.meta.url), 'utf8');
const openapiDoc = yaml.parse(openapiText);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));

app.use(notFound);
app.use(errorHandler);

export default app;

