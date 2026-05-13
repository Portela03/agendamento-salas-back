import { IResetPasswordRepository } from '../../../domain/repositories/IResetPasswordRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class ResetPasswordUseCase {
  constructor(
    private readonly resetPasswordRepo: IResetPasswordRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetToken = await this.resetPasswordRepo.findByTokenHash(tokenHash);

    if (!resetToken) {
      throw new Error('Token inválido ou expirado');
    }

    if (resetToken.used) {
      throw new Error('Token já utilizado');
    }

    if (resetToken.expireAt < new Date()) {
      throw new Error('Token expirado');
    }

    const realUser = await this.userRepo.findById(resetToken.userId);
    if (!realUser) {
      throw new Error('Usuário não encontrado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.updateSenha(realUser.id, passwordHash);
    await this.resetPasswordRepo.markUsed(resetToken.id);
  }
}