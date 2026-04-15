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
    
    const conflito = await this.reservaRepository.findConflito(
      data.salaId,
      data.data,
      data.horario
    )

    if (conflito) {
      throw new Error("Já existe reserva para essa sala nesse horário")
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