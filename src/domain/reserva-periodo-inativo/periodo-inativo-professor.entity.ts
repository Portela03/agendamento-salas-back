export interface PeriodoInativoProfessorProps {
  chave: string
  dataInicio: Date
  dataFim: Date
  createdAt: Date
  updatedAt: Date
}

export class PeriodoInativoProfessor {
  private readonly props: PeriodoInativoProfessorProps

  constructor(props: PeriodoInativoProfessorProps) {
    this.props = props
  }

  get chave(): string {
    return this.props.chave
  }

  get dataInicio(): Date {
    return this.props.dataInicio
  }

  get dataFim(): Date {
    return this.props.dataFim
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  toJSON() {
    return {
      chave: this.chave,
      dataInicio: this.dataInicio,
      dataFim: this.dataFim,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
