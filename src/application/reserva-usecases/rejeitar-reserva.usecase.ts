import { ReservaRepository } from "../../domain/reserva/reserva-repository.interface";
import { ReservaStatus } from "../../domain/reserva/reserva-status.enum";
import { INotificationService } from "../notification/notification.service.interface";

export class RejeitarReservaUseCase {
  constructor(
    private reservaRepository: ReservaRepository,
    private notificationService?: INotificationService,
  ) {}

  async execute(id: string, justificativa: string) {
    if (!justificativa || justificativa.trim().length === 0) {
      throw new Error('A justificativa é obrigatória para rejeitar uma reserva.')
    }

    const reserva = await this.reservaRepository.updateStatus(
      id,
      ReservaStatus.REJEITADA,
      justificativa.trim()
    );
    void this.notificationService?.notifyReservaRejeitada(reserva);
    return reserva;
  }
}