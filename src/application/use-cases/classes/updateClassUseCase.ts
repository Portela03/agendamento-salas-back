import { z } from 'zod';
import { Class, ClassType, ClassStatus} from '../../../domain/entities/Class';
import { IClassRepository } from '@domain/repositories/IClassRepository';

const updateClassSchema = z.object({
    id: z.string().uuid(),
    data: z.object({
        name: z.string().min(2).optional(),
        description: z.string().nullable().optional(),
        capacity: z.number().int().min(1).optional(),
        type: z.enum(['LABORATORIO', 'SALA', 'AUDITORIO'], {
            errorMap: () => ({ message: 'Espaço deve ser LABORATORIO, SALA ou AUDITORIO' }),
        }).optional(),
        status: z.enum(['INDISPONIVEL', 'DISPONIVEL'], {
            errorMap: () => ({ message: 'Espaço deve estar INDISPONIVEL ou DISPONIVEL' }),
        }).optional(),
    }),
});

export interface UpdateClassRequest {
  id: string;
  data: Partial<{
    name: string;
    description: string | null;
    capacity: number;
    type: ClassType;
    status: ClassStatus;
  }>;
}

export interface UpdateClassResponse {
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

export class UpdateClassUseCase {
    constructor(private readonly classRepository: IClassRepository) {}

    async execute({id, data}: UpdateClassRequest): Promise<UpdateClassResponse> {
        const parsed = updateClassSchema.parse({id, data});

        if(Object.keys(parsed.data).length === 0) {
            throw new Error('Modifique ao menos um campo para atualizar')
        }

        const existing = await this.classRepository.findById(parsed.id);
        if(!existing) {
            throw new Error('Sala não encontrada');
        }

        const classroom = await this.classRepository.update(parsed.id, parsed.data);

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
