import { IResetPasswordRepository } from '../../../domain/repositories/IResetPasswordRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { EmailService } from '../../../infrastructure/email/email.service';
import { emailEsqueceuSenha } from '../../../infrastructure/email/email.templates';

import crypto from 'crypto';

export class SendResetPasswordUseCase {
  constructor(
    private readonly resetPasswordRepo: IResetPasswordRepository,
    private readonly userRepo: IUserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      console.log('[ResetSenha] usuário não encontrado:', email);
      const err = new Error('Email não encontrado.');
      (err as any).code = 'USER_NOT_FOUND';
      throw err;
    }

    if (user.status !== 'APROVADO') {
      console.log('[ResetSenha] usuário não aprovado:', email, user.status);
      const err = new Error('Conta ainda não aprovada.');
      (err as any).code = 'USER_NOT_APPROVED';
      throw err;
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expireAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.resetPasswordRepo.create({
      userId: user.id, 
      tokenHash, 
      expireAt
    });

    await this.emailService.sendMail(
      user.email,
      'Redefinição de senha',
      emailEsqueceuSenha(user.name, token),
    );
    console.log('[ResetSenha] tentativa de envio para:', user.email);
  }
}