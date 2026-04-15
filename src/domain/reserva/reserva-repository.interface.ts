import { Reserva } from './reserva.entity'

export interface ReservaRepository {
  create(reserva: Reserva): Promise<Reserva>

  findAll(): Promise<Reserva[]>

  findByProfessor(professorId: string): Promise<Reserva[]>

  findConflito(
    salaId: string,
    data: Date,
    horario: string
  ): Promise<Reserva | null>

  updateStatus(
    id: string,
    status: string,
    justificativa?: string
  ): Promise<Reserva>
}