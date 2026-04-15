import { z } from 'zod';
import { Class, ClassType, ClassStatus} from '../../../domain/entities/Class';
import { IClassRepository } from '@domain/repositories/IClassRepository';

//Validar dados 
const createClassSchema = z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.'),
    description: z.string().nullable().optional(),
    capacity: z.number().int('Capacidade deve ser um número inteiro').min(1, 'Capacidade deve ser pelo menos 1.'),
    type: z.enum(['LABORATORIO', 'SALA', 'AUDITORIO'], {
        errorMap: () => ({message: 'Espaço deve ser LABORATORIO, SALA ou AUDITORIO'}),
    }),
});

//Dados que entram no Use Case
export interface CreateClassRequest {
    name: string;
    description?: string | null;
    capacity: number;
    type: ClassType;
}

//Dados que saem do Use Case
export interface CreateClassResponse {
    class: {
        id: string;
        name: string;
        description?: string | null;
        capacity: number;
        type: ClassType;
        status: ClassStatus;
        createdAt: Date;
    };
}


export class CreateClassUseCase {
    constructor(private readonly classRepository: IClassRepository) {}

    async execute(request: CreateClassRequest): Promise<CreateClassResponse> {
        const { name, description, capacity, type } = createClassSchema.parse(request)
        
        const classroom: Class = await this.classRepository.create({
            name, 
            description,
            capacity,
            type,
            status: 'DISPONIVEL',
        });

        return {
            class: {
                id: classroom.id,
                name: classroom.name, 
                description: classroom.description,
                capacity: classroom.capacity,
                type: classroom.type,
                status: classroom.status,
                createdAt: classroom.createdAt,
            },
        };
    }
}