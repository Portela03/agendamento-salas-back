import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { CreateUserUseCase } from '../../../application/use-cases/users/CreateUserUseCase';
import { RegisterUserUseCase } from '../../../application/use-cases/users/RegisterUserUseCase';
import { ListPendingUsersUseCase } from '../../../application/use-cases/users/ListPendingUsersUseCase';
import { ApproveUserUseCase } from '../../../application/use-cases/users/ApproveUserUseCase';
import { prismaClient } from '../../database/prisma/prismaClient';
import { PrismaUserRepository } from '../../database/prisma/PrismaUserRepository';
import { notificationService } from '../../notification/notification.singleton';

/**
 * UserController — handles HTTP concerns and delegates to CreateUserUseCase.
 */
export class UserController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userRepository = new PrismaUserRepository(prismaClient);
      const registerUser = new RegisterUserUseCase(userRepository, notificationService);

      const result = await registerUser.execute(req.body);

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: 'Dados inválidos.', errors: error.flatten().fieldErrors });
        return;
      }
      if (error instanceof Error) {
        if (error.message.includes('e-mail')) {
          res.status(409).json({ message: error.message });
          return;
        }
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userRepository = new PrismaUserRepository(prismaClient);
      const createUser = new CreateUserUseCase(userRepository);

      const result = await createUser.execute(req.body);

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: 'Dados inválidos.', errors: error.flatten().fieldErrors });
        return;
      }
      if (error instanceof Error) {
        // Conflict: email already exists
        if (error.message.includes('e-mail')) {
          res.status(409).json({ message: error.message });
          return;
        }
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async listPending(_req: Request, res: Response): Promise<void> {
    try {
      const userRepository = new PrismaUserRepository(prismaClient);
      const listPendingUsers = new ListPendingUsersUseCase(userRepository);

      const result = await listPendingUsers.execute();
      res.status(200).json(result);
    } catch {
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async approve(req: Request, res: Response): Promise<void> {
    try {
      const userRepository = new PrismaUserRepository(prismaClient);
      const approveUser = new ApproveUserUseCase(userRepository, notificationService);

      const result = await approveUser.execute({ userId: req.params.id });

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: 'Dados inválidos.', errors: error.flatten().fieldErrors });
        return;
      }

      if (error instanceof Error) {
        if (error.message.includes('não encontrado')) {
          res.status(404).json({ message: error.message });
          return;
        }
        res.status(400).json({ message: error.message });
        return;
      }

      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async reject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prismaClient.user.delete({ where: { id } });
      res.status(200).json({ message: 'Acesso recusado e registro removido.' });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
}
