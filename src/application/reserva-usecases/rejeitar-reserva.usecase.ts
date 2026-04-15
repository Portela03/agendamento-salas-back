import { ReservaRepository } from "../../domain/reserva/reserva-repository.interface";
import { ReservaStatus } from "../../domain/reserva/reserva-status.enum";

export class RejeitarReservaUseCase {
  constructor(private reservaRepository: ReservaRepository) {}

  async execute(id: string) {
    return await this.reservaRepository.updateStatus(
      id,
      ReservaStatus.REJEITADA
    )
  }
}