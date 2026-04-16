import { Class } from '../../../domain/entities/Class';
import { IClassRepository } from '@domain/repositories/IClassRepository';

export class FindByIdClassUseCase {
    constructor (private readonly classRepository: IClassRepository) {}

    async execute(id:string): Promise<Class> {
        const classroom = await this.classRepository.findById(id);
        
        if(!classroom) {
            throw new Error('Sala não encontrada'); 
        }

        return classroom 
    }
} 
