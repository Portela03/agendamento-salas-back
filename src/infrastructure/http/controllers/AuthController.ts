import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthenticateUserUseCase } from '../../../application/use-cases/auth/AuthenticateUserUseCase';
import { prismaClient } from '../../database/prisma/prismaClient';
import { PrismaUserRepository } from '../../database/prisma/PrismaUserRepository';

/**
 * AuthController — handles HTTP concerns and delegates business logic to
 * the AuthenticateUserUseCase.
 */
export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const userRepository = new PrismaUserRepository(prismaClient);
      const authenticateUser = new AuthenticateUserUseCase(userRepository);

      const result = await authenticateUser.execute(req.body);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: 'Dados inválidos.', errors: error.flatten().fieldErrors });
        return;
      }
      if (error instanceof Error) {
        res.status(401).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
}
