import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { authRouter } from '../infrastructure/http/routes/authRoutes';
import { userRouter } from '../infrastructure/http/routes/userRoutes';
import { classRouter} from '../infrastructure/http/routes/classRoutes';
import { bootstrapFirstCoordinator } from './bootstrapFirstCoordinator';
import { reservaRoutes } from '../infrastructure/http/routes/reservaRoutes';
import { ensureAuthenticated } from '../infrastructure/http/middlewares/authMiddleware';
import { prismaClient } from '../infrastructure/database/prisma/prismaClient';


const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Requests without origin (health checks, server-to-server) should pass.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origem não permitida pelo CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/class', classRouter);

app.use('/api/reservas', ensureAuthenticated, reservaRoutes);

// ── Salas (listagem para o frontend) ─────────────────────────────────────────
app.get('/api/salas', ensureAuthenticated, async (_req, res) => {
  try {
    const salas = await prismaClient.sala.findMany({ orderBy: { nome: 'asc' } });
    res.json(salas);
  } catch {
    res.status(500).json({ message: 'Erro ao buscar salas.' });
  }
});

// ── Health-check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});



// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 8888;

async function startServer() {
  await bootstrapFirstCoordinator();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}




void startServer();

export { app };
