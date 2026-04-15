import { ReservaRepository } from "../../domain/reserva/reserva-repository.interface";
import { ReservaStatus } from "../../domain/reserva/reserva-status.enum";

export class RejeitarReservaUseCase {
  constructor(private reservaRepository: ReservaRepository) {}

  async execute(id: string, justificativa: string) {
    if (!justificativa || justificativa.trim().length === 0) {
      throw new Error('A justificativa é obrigatória para rejeitar uma reserva.')
    }

    return await this.reservaRepository.updateStatus(
      id,
      ReservaStatus.REJEITADA,
      justificativa.trim()
    )
  }
}