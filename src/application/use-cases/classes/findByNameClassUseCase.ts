import { Class } from '../../../domain/entities/Class';
import { IClassRepository } from '@domain/repositories/IClassRepository';

export class FindByNameClassUseCase {
    constructor (private readonly classRepository: IClassRepository) {}

    async execute(name:string): Promise<Class> {
        const classroom = await this.classRepository.findByName(name);
        
        if(!classroom) {
            throw new Error('Sala não encontrada'); 
        }

        return classroom 
    }
} 
