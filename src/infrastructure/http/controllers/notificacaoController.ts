import { Request, Response } from 'express';
import { prismaClient } from '../../database/prisma/prismaClient';
import { PrismaNotificacaoRepository } from '../../database/prisma/PrismaNotificacaoRepository';

const notificacaoRepository = new PrismaNotificacaoRepository(prismaClient);

export class NotificacaoController {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const notificacoes = await notificacaoRepository.findByUserId(userId);
      res.json(notificacoes);
    } catch {
      res.status(500).json({ message: 'Erro ao buscar notificações.' });
    }
  }

  async marcarTodasComoLidas(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      await notificacaoRepository.markAllAsRead(userId);
      res.json({ message: 'Notificações marcadas como lidas.' });
    } catch {
      res.status(500).json({ message: 'Erro ao marcar notificações.' });
    }
  }
}
