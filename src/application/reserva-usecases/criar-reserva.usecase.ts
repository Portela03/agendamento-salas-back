import { Reserva } from "../../domain/reserva/reserva.entity";
import { ReservaRepository } from "../../domain/reserva/reserva-repository.interface";

interface CriarReservaRequest {
  professorId: string
  salaId: string
  data: Date
  horario: string
  periodo: string
  semestre: string
}

export class CriarReservaUseCase {
  constructor(private reservaRepository: ReservaRepository) {}

  async execute(data: CriarReservaRequest) {

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataReserva = new Date(data.data);
    dataReserva.setHours(0, 0, 0, 0);

    if (dataReserva < hoje) {
      throw new Error('Não é possível agendar uma reserva para uma data passada.')
    }

    const conflito = await this.reservaRepository.findConflito(
      data.salaId,
      data.data,
      data.horario
    )

    if (conflito) {
      if (conflito.status === 'APROVADA') {
        throw new Error('Já existe uma reserva APROVADA para essa sala, data e horário. Escolha outro horário.')
      }
      throw new Error('Já existe uma solicitação PENDENTE para essa sala, data e horário. Aguarde a análise ou escolha outro horário.')
    }

    const reserva = new Reserva({
      professorId: data.professorId,
      salaId: data.salaId,
      data: data.data,
      horario: data.horario,
      periodo: data.periodo,
      semestre: data.semestre
    })

    return await this.reservaRepository.create(reserva)
  }
}