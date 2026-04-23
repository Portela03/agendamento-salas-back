import { Router } from 'express';
import { NotificacaoController } from '../controllers/notificacaoController';

const notificacaoRoutes = Router();
const notificacaoController = new NotificacaoController();

// GET /api/notificacoes — listar notificações do usuário logado
notificacaoRoutes.get('/', (req, res) => notificacaoController.listar(req, res));

// PATCH /api/notificacoes/read-all — marcar todas como lidas
notificacaoRoutes.patch('/read-all', (req, res) =>
  notificacaoController.marcarTodasComoLidas(req, res),
);

export { notificacaoRoutes };
