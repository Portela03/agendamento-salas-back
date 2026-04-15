import { Class, ClassType, ClassStatus } from '../entities/Class';

export interface CreateClassData {
    name: string;
    description?: string | null;
    capacity: number;
    type: ClassType;
    status: ClassStatus; 
}

export interface IClassRepository {
    create(data: CreateClassData): Promise<Class>;
    update(id: string, data: Partial<CreateClassData>): Promise<Class>;
    findById(id: string): Promise<Class | null>;
    findByName(name: string): Promise<Class | null>;
    listAll(): Promise<Class[]>;
}