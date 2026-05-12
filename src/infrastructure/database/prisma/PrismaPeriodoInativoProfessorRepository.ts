import { PrismaClient } from '@prisma/client'
import {
  DefinirPeriodoInativoProfessorData,
  IPeriodoInativoProfessorRepository,
} from '../../../domain/reserva-periodo-inativo/periodo-inativo-professor.repository.interface'
import { PeriodoInativoProfessor } from '../../../domain/reserva-periodo-inativo/periodo-inativo-professor.entity'

const PERIODO_INATIVO_PROFESSOR_CHAVE = 'PROFESSOR'

export class PrismaPeriodoInativoProfessorRepository implements IPeriodoInativoProfessorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getCurrent(): Promise<PeriodoInativoProfessor | null> {
    const raw = await this.prisma.periodoInativoProfessor.findUnique({
      where: { chave: PERIODO_INATIVO_PROFESSOR_CHAVE },
    })

    return raw ? this.toDomain(raw) : null
  }

  async findByDate(data: Date): Promise<PeriodoInativoProfessor | null> {
    const raw = await this.prisma.periodoInativoProfessor.findFirst({
      where: {
        chave: PERIODO_INATIVO_PROFESSOR_CHAVE,
        dataInicio: {
          lte: data,
        },
        dataFim: {
          gte: data,
        },
      },
    })

    return raw ? this.toDomain(raw) : null
  }

  async save(data: DefinirPeriodoInativoProfessorData): Promise<PeriodoInativoProfessor> {
    const raw = await this.prisma.periodoInativoProfessor.upsert({
      where: { chave: PERIODO_INATIVO_PROFESSOR_CHAVE },
      create: {
        chave: PERIODO_INATIVO_PROFESSOR_CHAVE,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
      },
      update: {
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
      },
    })

    return this.toDomain(raw)
  }

  async delete(): Promise<void> {
    await this.prisma.periodoInativoProfessor.deleteMany({
      where: { chave: PERIODO_INATIVO_PROFESSOR_CHAVE },
    })
  }

  private toDomain(raw: {
    chave: string
    dataInicio: Date
    dataFim: Date
    createdAt: Date
    updatedAt: Date
  }): PeriodoInativoProfessor {
    return new PeriodoInativoProfessor({
      chave: raw.chave,
      dataInicio: raw.dataInicio,
      dataFim: raw.dataFim,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    })
  }
}
