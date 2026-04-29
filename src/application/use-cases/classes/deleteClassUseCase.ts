import { IClassRepository } from '../../../domain/repositories/IClassRepository'

export class DeleteClassUseCase {
  constructor(private readonly classRepository: IClassRepository) {}

  async execute(id: string): Promise<void> {
    await this.classRepository.delete(id)
  }
}