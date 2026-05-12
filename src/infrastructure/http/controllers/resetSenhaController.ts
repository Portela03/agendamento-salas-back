import { Request, Response } from 'express';
import { prismaClient } from '../../database/prisma/prismaClient';
import { PrismaNotificacaoRepository } from '../../database/prisma/PrismaNotificacaoRepository';
import { PrismaResetSenhaRepository } from '../../database/prisma/PrismaResetSenhaRepository';
import { ResetPasswordUseCase } from '../../../application/use-cases/notification/ResetPasswordUseCase';
import { SendResetPasswordUseCase } from '../../../application/use-cases/notification/SendResetPasswordUseCase';

import { PrismaUserRepository } from '../../database/prisma/PrismaUserRepository';
import { EmailService } from '../../email/email.service';
import { NotificationService } from '../../notification/notification.service';

const notificacaoRepository = new PrismaNotificacaoRepository(prismaClient);
const resetSenhaRepository = new PrismaResetSenhaRepository(prismaClient);
const userRepository = new PrismaUserRepository(prismaClient);
const emailService = new EmailService();
const notificationService = new NotificationService(
  notificacaoRepository,
  userRepository,
  emailService,
);

export class ResetSenhaController{
    
      async sendResetPassword(req: Request, res: Response): Promise<void> {
        try {
          const { email } = req.body;
    
          if (!email) {
            res.status(400).json({ message: 'Email é obrigatório.' });
            return;
          }
    
          const useCase = new SendResetPasswordUseCase(
            resetSenhaRepository,
            userRepository,
            emailService,
          );
          await useCase.execute(email);
    
          res.json({ message: 'Se o email estiver cadastrado e aprovado, um link de redefinição será enviado.'});
        } catch (error) {
          console.error('[ResetSenhaController] sendResetPassword:', error);
          res.status(500).json({ message: 'Erro ao enviar email.' });
        }
      }
    
    
      async resetPassword(req: Request, res: Response): Promise <void> {
         try {
          const { token, password } = req.body;
    
          if (!token || !password) {
            res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
            return;
          }
    
          if (typeof password !== 'string' || password.length < 6) {
            res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres.' });
            return;
          }
    
          const useCase = new ResetPasswordUseCase(resetSenhaRepository, userRepository);
          await useCase.execute(token, password);
    
          res.json({ message: 'Senha atualizada com sucesso.' });
        } catch (error: any) {
          console.error('[ResetSenhaController] resetPassword:', error);
          res.status(400).json({ message: error?.message ?? 'Erro ao resetar senha.' });
        }
      }
}