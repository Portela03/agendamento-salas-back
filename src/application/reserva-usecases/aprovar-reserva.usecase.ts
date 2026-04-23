import { ReservaRepository } from "../../domain/reserva/reserva-repository.interface";
import { ReservaStatus } from "../../domain/reserva/reserva-status.enum";
import { INotificationService } from "../notification/notification.service.interface";

export class AprovarReservaUseCase {
  constructor(
    private reservaRepository: ReservaRepository,
    private notificationService?: INotificationService,
  ) {}

  async execute(id: string) {
    const reserva = await this.reservaRepository.updateStatus(
      id,
      ReservaStatus.APROVADA
    );
    void this.notificationService?.notifyReservaAprovada(reserva);
    return reserva;
  }
}