import { PrismaClient } from '@prisma/client';
import { Notificacao, NotificacaoType } from '../../../domain/notificacao/notificacao.entity';
import {
  CreateNotificacaoData,
  INotificacaoRepository,
} from '../../../domain/notificacao/notificacao-repository.interface';

export class PrismaNotificacaoRepository implements INotificacaoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateNotificacaoData): Promise<Notificacao> {
    const raw = await this.prisma.notificacao.create({
      data: {
        userId: data.userId,
        message: data.message,
        type: data.type,
      },
    });
    return this.toDomain(raw);
  }

  async findByUserId(userId: string, unreadOnly = false): Promise<Notificacao[]> {
    const raws = await this.prisma.notificacao.findMany({
      where: { userId, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: 'desc' },
    });
    return raws.map((r) => this.toDomain(r));
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notificacao.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  private toDomain(raw: {
    id: string;
    userId: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: Date;
  }): Notificacao {
    return new Notificacao({
      id: raw.id,
      userId: raw.userId,
      message: raw.message,
      type: raw.type as NotificacaoType,
      read: raw.read,
      createdAt: raw.createdAt,
    });
  }
}
