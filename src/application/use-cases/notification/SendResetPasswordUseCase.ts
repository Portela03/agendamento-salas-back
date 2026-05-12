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
    if (!user || user.status !== 'APROVADO') return;
    
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
    );  }
}