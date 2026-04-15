import { ReservaRepository } from "../../domain/reserva/reserva-repository.interface";

export class ListarReservasProfessorUseCase {
  constructor(private reservaRepository: ReservaRepository) {}

  async execute(professorId: string) {
    return await this.reservaRepository.findByProfessor(professorId)
  }
}