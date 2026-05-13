import {
  DefinirPeriodoInativoProfessorData,
  IPeriodoInativoProfessorRepository,
} from '../../domain/reserva-periodo-inativo/periodo-inativo-professor.repository.interface'
import { PeriodoInativoProfessor } from '../../domain/reserva-periodo-inativo/periodo-inativo-professor.entity'

function parseDate(data: Date | string): Date {
  const parsed = new Date(data)

  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Data inválida.')
  }

  parsed.setHours(0, 0, 0, 0)
  return parsed
}

function ensureIntervalIsValid(dataInicio: Date, dataFim: Date): void {
  if (dataInicio.getTime() > dataFim.getTime()) {
    throw new Error('A data fim deve ser maior ou igual a data início.')
  }
}

export class DefinirPeriodoInativoProfessorUseCase {
  constructor(private readonly repository: IPeriodoInativoProfessorRepository) {}

  async execute(data: DefinirPeriodoInativoProfessorData): Promise<PeriodoInativoProfessor> {
    const dataInicio = parseDate(data.dataInicio)
    const dataFim = parseDate(data.dataFim)

    ensureIntervalIsValid(dataInicio, dataFim)

    return this.repository.save({ dataInicio, dataFim })
  }
}

export class ObterPeriodoInativoProfessorUseCase {
  constructor(private readonly repository: IPeriodoInativoProfessorRepository) {}

  async execute(): Promise<PeriodoInativoProfessor | null> {
    return this.repository.getCurrent()
  }
}

export class RemoverPeriodoInativoProfessorUseCase {
  constructor(private readonly repository: IPeriodoInativoProfessorRepository) {}

  async execute(): Promise<void> {
    await this.repository.delete()
  }
}

export class VerificarPeriodoInativoProfessorUseCase {
  constructor(private readonly repository: IPeriodoInativoProfessorRepository) {}

  async execute(data: Date): Promise<PeriodoInativoProfessor | null> {
    return this.repository.findByDate(data)
  }
}
