import { PrismaClient } from '@prisma/client';
import { User, UserRole, UserStatus } from '../../../domain/entities/User';
import { CreateUserData, IUserRepository } from '../../../domain/repositories/IUserRepository';

/**
 * PrismaUserRepository — concrete implementation of IUserRepository.
 * Lives in the infrastructure layer and depends on Prisma (a detail),
 * not on domain abstractions.
 */
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    return raw ? this.toDomain(raw) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    return raw ? this.toDomain(raw) : null;
  }

  async findAllByRole(role: UserRole): Promise<User[]> {
    const raws = await this.prisma.user.findMany({
      where: { role },
      orderBy: { createdAt: 'asc' },
    });
    return raws.map((raw) => this.toDomain(raw));
  }

  async listPendingUsers(): Promise<User[]> {
    const raws = await this.prisma.user.findMany({
      where: { status: 'PENDENTE' },
      orderBy: { createdAt: 'asc' },
    });
    return raws.map((raw) => this.toDomain(raw));
  }

  async approveUser(id: string): Promise<User | null> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    const raw = await this.prisma.user.update({
      where: { id },
      data: {
        status: 'APROVADO',
        approvedAt: new Date(),
      },
    });

    return this.toDomain(raw);
  }

  async countUsers(): Promise<number> {
    return this.prisma.user.count();
  }

  async create(data: CreateUserData): Promise<User> {
    const raw = await this.prisma.user.create({
      data: {
        ...data,
        status: data.status ?? 'PENDENTE',
      },
    });
    return this.toDomain(raw);
  }

  private toDomain(raw: {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    status: string;
    approvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      password: raw.password,
      role: raw.role as UserRole,
      status: raw.status as UserStatus,
      approvedAt: raw.approvedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
