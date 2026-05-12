import { PeriodoInativoProfessor } from './periodo-inativo-professor.entity'

export interface DefinirPeriodoInativoProfessorData {
  dataInicio: Date
  dataFim: Date
}

export interface IPeriodoInativoProfessorRepository {
  getCurrent(): Promise<PeriodoInativoProfessor | null>
  findByDate(data: Date): Promise<PeriodoInativoProfessor | null>
  save(data: DefinirPeriodoInativoProfessorData): Promise<PeriodoInativoProfessor>
  delete(): Promise<void>
}
