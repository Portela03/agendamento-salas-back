import { Reserva } from './reserva.entity'

export interface CalendarioFiltros {
  mes: number
  ano: number
  classId?: string
  periodo?: string
  semestre?: string
  incluirAguardando?: boolean
}

export interface ReservaRepository {
  create(reserva: Reserva): Promise<Reserva>

  findAll(): Promise<Reserva[]>

  findByProfessor(professorId: string): Promise<Reserva[]>

  findConflito(
    salaId: string,
    data: Date,
    horarioInicio: string,
    horarioFim: string
  ): Promise<Reserva | null>

  updateStatus(
    id: string,
    status: string,
    justificativa?: string
  ): Promise<Reserva>

  findByCalendario(filtros: CalendarioFiltros): Promise<Reserva[]>
}