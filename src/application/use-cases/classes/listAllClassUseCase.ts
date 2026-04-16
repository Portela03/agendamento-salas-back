import { Class, ClassType, ClassStatus} from '../../../domain/entities/Class';
import { IClassRepository } from '@domain/repositories/IClassRepository';

export interface ListAllClassResponse {
    class: Array <{
        id: string;
        name: string;
        description?: string | null;
        capacity: number;
        type: ClassType;
        status: ClassStatus;
        createdAt: Date;
    }>;
}

export class ListAllClassUseCase {
    constructor(private readonly classRepository: IClassRepository) {}

    async execute(): Promise<ListAllClassResponse> {
        const classrooms = await this.classRepository.listAll();

        return {
            class: classrooms.map((classroom) => ({
                id: classroom.id,
                name: classroom.name, 
                description: classroom.description,
                capacity: classroom.capacity,
                type: classroom.type,
                status: classroom.status,
                createdAt: classroom.createdAt,
            })),
        };
    }
}

