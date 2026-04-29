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
  private sanitizeUser(user: {
    password: string;
    [key: string]: unknown;
  }) {
    const { password: _, ...publicUser } = user;
    return publicUser;
  }

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

      // Verificar se o usuário existe antes de tentar deletar
      const user = await prismaClient.user.findUnique({ where: { id } });
      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }

      // Deletar dependências em transação para evitar violação de foreign key
      await prismaClient.$transaction(async (tx) => {
        // Deletar notificações vinculadas ao usuário
        await tx.notificacao.deleteMany({ where: { userId: id } });
        // Deletar reservas vinculadas ao usuário (caso existam)
        await tx.reserva.deleteMany({ where: { professorId: id } });
        // Agora deletar o usuário
        await tx.user.delete({ where: { id } });
      });

      res.status(200).json({ message: 'Acesso recusado e registro removido.' });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async listAll(_req: Request, res: Response): Promise<void> {
    try {
      const users = await prismaClient.user.findMany({
        orderBy: { name: 'asc' },
      });

      res.status(200).json({
        users: users.map((user) => this.sanitizeUser(user)),
      });
    } catch {
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, role, status } = req.body;

      const normalizedRole = role === 'PROFESSOR' || role === 'COORDENADOR' ? role : undefined;
      const normalizedStatus = status === 'PENDENTE' || status === 'APROVADO' ? status : undefined;

      const existingUser = await prismaClient.user.findUnique({ where: { id } });
      if (!existingUser) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }

      const updatedUser = await prismaClient.user.update({
        where: { id },
        data: {
          ...(typeof name === 'string' ? { name } : {}),
          ...(typeof email === 'string' ? { email } : {}),
          ...(normalizedRole ? { role: normalizedRole } : {}),
          ...(normalizedStatus
            ? {
                status: normalizedStatus,
                approvedAt: normalizedStatus === 'APROVADO' ? existingUser.approvedAt ?? new Date() : null,
              }
            : {}),
        },
      });

      res.status(200).json({ user: this.sanitizeUser(updatedUser) });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        res.status(409).json({ message: 'Já existe um usuário cadastrado com este e-mail.' });
        return;
      }

      res.status(500).json({ message: 'Erro ao atualizar usuário.' });
    }
  }

  async toggleStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prismaClient.user.findUnique({ where: { id } });
      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }

      const nextStatus = user.status === 'APROVADO' ? 'PENDENTE' : 'APROVADO';

      const updatedUser = await prismaClient.user.update({
        where: { id },
        data: {
          status: nextStatus,
          approvedAt: nextStatus === 'APROVADO' ? new Date() : null,
        },
      });

      res.status(200).json({ user: this.sanitizeUser(updatedUser) });
    } catch {
      res.status(500).json({ message: 'Erro ao alterar status do usuário.' });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prismaClient.user.findUnique({ where: { id } });
      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }

      await prismaClient.$transaction(async (tx) => {
        await tx.notificacao.deleteMany({ where: { userId: id } });
        await tx.reserva.deleteMany({ where: { professorId: id } });
        await tx.user.delete({ where: { id } });
      });

      res.status(200).json({ message: 'Usuário removido com sucesso.' });
    } catch {
      res.status(500).json({ message: 'Erro ao remover usuário.' });
    }
  }
}
