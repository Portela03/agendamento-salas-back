import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { authRouter } from '../infrastructure/http/routes/authRoutes';
import { userRouter } from '../infrastructure/http/routes/userRoutes';
import { bootstrapFirstCoordinator } from './bootstrapFirstCoordinator';
import { reservaRoutes } from '../infrastructure/http/routes/reservaRoutes';
import { ensureAuthenticated } from '../infrastructure/http/middlewares/authMiddleware';


const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

app.use('/api/reservas', ensureAuthenticated, reservaRoutes);

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
