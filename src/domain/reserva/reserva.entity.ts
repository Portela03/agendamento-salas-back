import { ReservaStatus } from './reserva-status.enum'

export class Reserva {
  id?: string
  professorId: string
  salaId: string
  data: Date
  horario: string
  periodo: string
  semestre: string
  status: ReservaStatus
  createdAt: Date

  constructor(props: {
    id?: string
    professorId: string
    salaId: string
    data: Date
    horario: string
    periodo: string
    semestre: string
    status?: ReservaStatus
    createdAt?: Date
  }) {
    this.id = props.id
    this.professorId = props.professorId
    this.salaId = props.salaId
    this.data = props.data
    this.horario = props.horario
    this.periodo = props.periodo
    this.semestre = props.semestre
    this.status = props.status ?? ReservaStatus.AGUARDANDO
    this.createdAt = props.createdAt ?? new Date()
  }

  aprovar() {
    this.status = ReservaStatus.APROVADA
  }

  rejeitar() {
    this.status = ReservaStatus.REJEITADA
  }
}