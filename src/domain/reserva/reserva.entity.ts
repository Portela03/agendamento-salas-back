import { ReservaStatus } from './reserva-status.enum'

export class Reserva {
  id?: string
  professorId: string
  salaId: string
  data: Date
  horario: string
  horarioInicio: string
  horarioFim: string
  turma: string
  periodo: string
  semestre: string
  status: ReservaStatus
  justificativa?: string
  createdAt: Date

  // Enriched fields (joined from DB, not persisted)
  professorNome?: string
  salaNome?: string

  constructor(props: {
    id?: string
    professorId: string
    salaId: string
    data: Date
    horario: string
    horarioInicio: string
    horarioFim: string
    turma: string
    periodo: string
    semestre: string
    status?: ReservaStatus
    justificativa?: string
    createdAt?: Date
    professorNome?: string
    salaNome?: string
  }) {
    this.id = props.id
    this.professorId = props.professorId
    this.salaId = props.salaId
    this.data = props.data
    this.horario = props.horario
    this.horarioInicio = props.horarioInicio
    this.horarioFim = props.horarioFim
    this.turma = props.turma
    this.periodo = props.periodo
    this.semestre = props.semestre
    this.status = props.status ?? ReservaStatus.AGUARDANDO
    this.justificativa = props.justificativa
    this.createdAt = props.createdAt ?? new Date()
    this.professorNome = props.professorNome
    this.salaNome = props.salaNome
  }

  aprovar() {
    this.status = ReservaStatus.APROVADA
  }

  rejeitar(justificativa: string) {
    this.status = ReservaStatus.REJEITADA
    this.justificativa = justificativa
  }
}