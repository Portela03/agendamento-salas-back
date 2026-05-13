import {
  DefinirPeriodoInativoProfessorData,
  IPeriodoInativoProfessorRepository,
} from '../../domain/reserva-periodo-inativo/periodo-inativo-professor.repository.interface'
import { PeriodoInativoProfessor } from '../../domain/reserva-periodo-inativo/periodo-inativo-professor.entity'
import ApiError from '../../shared/errors/ApiError'

function parseDate(data: Date | string): Date {
  // Accept Date, ISO (YYYY-MM-DD) and BR (DD/MM/YYYY) formats and create local-date
  if (data instanceof Date) {
    const d = new Date(data)
    if (Number.isNaN(d.getTime())) throw new ApiError('INVALID_DATE', 'Selecione uma data válida')
    d.setHours(0, 0, 0, 0)
    return d
  }

  if (typeof data === 'string') {
    // YYYY-MM-DD -> treat as local date
    const iso = data.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (iso) {
      const year = Number(iso[1])
      const month = Number(iso[2]) - 1
      const day = Number(iso[3])
      const d = new Date(year, month, day)
      if (Number.isNaN(d.getTime())) throw new ApiError('INVALID_DATE', 'Selecione uma data válida')
      d.setHours(0, 0, 0, 0)
      return d
    }

    // DD/MM/YYYY -> common BR format from front-end display
    const br = data.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (br) {
      const day = Number(br[1])
      const month = Number(br[2]) - 1
      const year = Number(br[3])
      const d = new Date(year, month, day)
      if (Number.isNaN(d.getTime())) throw new ApiError('INVALID_DATE', 'Selecione uma data válida')
      d.setHours(0, 0, 0, 0)
      return d
    }

    // fallback: try generic Date parse
    const parsed = new Date(data)
    if (Number.isNaN(parsed.getTime())) throw new ApiError('INVALID_DATE', 'Selecione uma data válida')
    parsed.setHours(0, 0, 0, 0)
    return parsed
  }

  throw new ApiError('INVALID_DATE', 'Selecione uma data válida')
}

function ensureIntervalIsValid(dataInicio: Date, dataFim: Date): void {
  if (dataInicio.getTime() > dataFim.getTime()) {
    throw new ApiError('INVALID_RANGE', 'A data fim deve ser maior ou igual à data início.')
  }
}

export class DefinirPeriodoInativoProfessorUseCase {
  constructor(private readonly repository: IPeriodoInativoProfessorRepository) {}

  async execute(data: DefinirPeriodoInativoProfessorData): Promise<PeriodoInativoProfessor> {
    const dataInicio = parseDate(data.dataInicio)
    const dataFim = parseDate(data.dataFim)

    // não permite bloquear dias anteriores ao dia atual (comparação em horário local)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    if (dataInicio.getTime() < hoje.getTime() || dataFim.getTime() < hoje.getTime()) {
      throw new ApiError('PAST_DATE', 'Não pode bloquear dias anteriores')
    }

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
