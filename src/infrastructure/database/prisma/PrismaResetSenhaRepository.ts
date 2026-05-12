import { PrismaClient } from '@prisma/client';
import { ResetPasswordData, IResetPasswordRepository } from '@domain/repositories/IResetPasswordRepository';
import { ResetPassword } from '@domain/entities/ResetPassword';

export class PrismaResetSenhaRepository implements IResetPasswordRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: Omit<ResetPasswordData, 'id' | 'createdAt' | 'used'>): Promise<ResetPassword> {
        const raw = await this.prisma.resetSenha.create({
            data: {
                userId: data.userId,
                tokenHash: data.tokenHash,
                expireAt: data.expireAt,
            },
        });

        return this.toDomain(raw);

    }

    async findById(id: string): Promise<ResetPassword | null>{
        const raw = await this.prisma.resetSenha.findUnique({ where: { id } });
        return raw ? this.toDomain(raw) : null;
    }

    async findByTokenHash(tokenHash: string): Promise<ResetPassword | null> {
        const raw = await this.prisma.resetSenha.findFirst({
            where: { tokenHash },
        });

        return raw ? this.toDomain(raw) : null;
    }

    async markUsed(id: string): Promise<ResetPassword>{
        const raw = await this.prisma.resetSenha.update({
            where: { id },
            data: {
                used: true,
            },
        });

        return this.toDomain(raw);
    }

    async listUsed():Promise<ResetPassword[]>{
        const raws = await this.prisma.resetSenha.findMany({
            where: {used: true},
            orderBy: {createdAt: 'asc'}
        });
        return raws.map((raw) => this.toDomain(raw))
    }

    private toDomain(raw: {
        id: string;
        userId: string;
        tokenHash: string;
        expireAt: Date;
        used: boolean;
        createdAt: Date;
    }): ResetPassword {
        return new ResetPassword({
            id: raw.id,
            userId: raw.userId,
            tokenHash: raw.tokenHash,
            expireAt: raw.expireAt,
            used: raw.used,
            createdAt: raw.createdAt,
        });
    }
}