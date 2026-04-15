import { PrismaClient } from '@prisma/client';
import { Class, ClassType, ClassStatus } from '../../../domain/entities/Class';
import { CreateClassData, IClassRepository } from '../../../domain/repositories/IClassRepository';  

export class PrismaClassRepository implements IClassRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateClassData): Promise<Class> {
        const raw = await this.prisma.class.create({
            data: {
                ...data,
            },
        });

        return this.toDomain(raw);
    }

    async update(id: string, data: Partial<CreateClassData>): Promise<Class> {
        const raw = await this.prisma.class.update({
            where: { id },
            data: {
                ...data,
            },
        });

        return this.toDomain(raw);
    }

    async findById(id: string): Promise<Class | null> {
        const raw = await this.prisma.class.findUnique({ where: { id } });
        return raw ? this.toDomain(raw) : null;
    }

    async findByName(name: string): Promise<Class | null> {
         const raw = await this.prisma.class.findUnique({ where: { name } });
         return raw ? this.toDomain(raw) : null;
    }

    async listAll(): Promise<Class[]> {
        const raws = await this.prisma.class.findMany({ 
            where: {status: 'DISPONIVEL'},
            orderBy: {name: 'asc'}
        });
        return raws.map((raw) => this.toDomain(raw));
    }

    private toDomain(raw: {
        id: string;
        name: string;
        description: string | null;
        capacity: number;
        type: ClassType;
        status: ClassStatus;
        createdAt: Date;
        updatedAt: Date;
    }): Class {
        return new Class({
            id: raw.id,
            name: raw.name,
            description: raw.description,
            capacity: raw.capacity,
            type: raw.type,
            status: raw.status,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        })
        
    }
}