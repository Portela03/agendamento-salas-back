import { ReservaRepository } from "../../domain/reserva/reserva-repository.interface";
import { ReservaStatus } from "../../domain/reserva/reserva-status.enum";

export class CancelarReservaUseCase {
  constructor(
    private reservaRepository: ReservaRepository,
  ) {}

  async execute(id: string, usuarioId: string, isCoordenador = false) {
    const reserva = await this.reservaRepository.findById(id);

    if (!reserva) {
      throw new Error("Reserva não encontrada.");
    }

    // Verifica se a reserva já foi cancelada
    if (reserva.status === ReservaStatus.CANCELADA) {
      throw new Error("A reserva já está cancelada.");
    }

    // Verifica se a reserva já foi rejeitada
    if (reserva.status === ReservaStatus.REJEITADA) {
      throw new Error("Não é possível cancelar uma reserva rejeitada.");
    }

    // Verifica permissão
    const isDonoDaReserva = reserva.professorId === usuarioId;

    if (!isDonoDaReserva && !isCoordenador) {
      throw new Error("Você não tem permissão para cancelar esta reserva.");
    }

    // Verifica se a reserva já aconteceu
    const agora = new Date();
    const dataReserva = new Date(reserva.data);

    // Ajusta o horário na data (caso horarioInicio esteja presente, ex: "08:00")
    if (reserva.horarioInicio) {
      const [horas, minutos] = reserva.horarioInicio.split(":");
      dataReserva.setHours(Number(horas) || 0, Number(minutos) || 0, 0, 0);
    }

    if (dataReserva < agora) {
      throw new Error("Não é possível cancelar uma reserva passada.");
    }

    // Atualiza status
    const reservaAtualizada = await this.reservaRepository.updateStatus(
      id,
      ReservaStatus.CANCELADA,
    );

    return reservaAtualizada;
  }
}