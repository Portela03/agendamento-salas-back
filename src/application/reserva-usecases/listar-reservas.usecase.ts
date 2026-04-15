import { ReservaRepository } from "../../domain/reserva/reserva-repository.interface";

export class ListarReservasUseCase {
  constructor(private reservaRepository: ReservaRepository) {}

  async execute() {
    return await this.reservaRepository.findAll()
  }
}