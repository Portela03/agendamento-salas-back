import { Reserva } from "../../domain/reserva/reserva.entity";
import { randomUUID } from "crypto";
import { ReservaRepository } from "../../domain/reserva/reserva-repository.interface";
import { IPeriodoInativoProfessorRepository } from "../../domain/reserva-periodo-inativo/periodo-inativo-professor.repository.interface";
import { INotificationService } from "../notification/notification.service.interface";
import {
  generateWeeklyDatesUntilSemesterEnd,
  getSemesterForDate,
  isBlockedAcademicDate,
  toDateKey,
} from "../../shared/academicCalendar";

interface CriarReservasSemestreRequest {
  professorId: string
  professorRole: string
  classId: string
  dataInicial: Date
  horarioInicio: string
  horarioFim: string
  turma: string
  ignorarConflitos?: boolean
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  if (
    !Number.isInteger(h) ||
    !Number.isInteger(m) ||
    h < 0 || h > 23 ||
    m < 0 || m > 59
  ) {
    throw new Error('Horario invalido. Use o formato HH:mm.')
  }
  return h * 60 + m
}

function inferPeriodo(horarioInicio: string): string {
  const hora = Number(horarioInicio.split(':')[0])
  if (hora < 12) return 'matutino'
  if (hora < 18) return 'vespertino'
  return 'noturno'
}

function isSameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR')
}

export class CriarReservasSemestreUseCase {
  constructor(
    private reservaRepository: ReservaRepository,
    private periodoInativoProfessorRepository?: IPeriodoInativoProfessorRepository,
    private notificationService?: INotificationService,
  ) {}

  async execute(data: CriarReservasSemestreRequest) {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const dataInicial = new Date(data.dataInicial)
    dataInicial.setHours(0, 0, 0, 0)

    if (dataInicial < hoje) {
      throw new Error('Nao e possivel agendar uma reserva para uma data passada.')
    }

    const inicio = toMinutes(data.horarioInicio)
    const fim = toMinutes(data.horarioFim)
    if (inicio >= fim) {
      throw new Error('A hora de termino deve ser maior que a hora de inicio.')
    }

    const agora = new Date()
    if (isSameDate(dataInicial, agora)) {
      const minutosAgora = agora.getHours() * 60 + agora.getMinutes()
      if (inicio <= minutosAgora) {
        throw new Error('Para o dia de hoje, o horario de inicio deve ser maior que o horario atual.')
      }
    }

    if (!data.turma || data.turma.trim().length === 0) {
      throw new Error('Turma e obrigatoria.')
    }

    const semestre = getSemesterForDate(dataInicial)
    if (!semestre) {
      throw new Error('A data inicial precisa estar dentro de um semestre letivo configurado.')
    }

    const bloqueioInicial = isBlockedAcademicDate(dataInicial)
    if (bloqueioInicial) {
      throw new Error(`A data inicial esta bloqueada para reservas: ${bloqueioInicial}.`)
    }

    const datasGeradas = generateWeeklyDatesUntilSemesterEnd(dataInicial)
    const datasValidas = datasGeradas.filter((date) => !isBlockedAcademicDate(date))

    if (datasValidas.length === 0) {
      throw new Error('Nenhuma data valida foi encontrada ate o fim do semestre.')
    }

    const conflitos: string[] = []
    const periodosInativos: string[] = []
    const datasComConflito = new Set<string>()

    for (const date of datasValidas) {
      if (data.professorRole === 'PROFESSOR' && this.periodoInativoProfessorRepository) {
        const periodoInativo = await this.periodoInativoProfessorRepository.findByDate(date)
        if (periodoInativo) {
          periodosInativos.push(formatDate(date))
          continue
        }
      }

      const conflito = await this.reservaRepository.findConflito(
        data.classId,
        date,
        data.horarioInicio,
        data.horarioFim
      )

      if (conflito) {
        conflitos.push(formatDate(date))
        datasComConflito.add(toDateKey(date))
      }
    }

    if (periodosInativos.length > 0) {
      throw new Error(`Existem datas dentro do periodo inativo do perfil Professor: ${periodosInativos.join(', ')}.`)
    }

    if (conflitos.length > 0 && !data.ignorarConflitos) {
      const error = new Error(`Existem conflitos de reserva nas datas: ${conflitos.join(', ')}.`)
      ;(error as Error & { code?: string; conflitos?: string[] }).code = 'SEMESTER_CONFLICTS'
      ;(error as Error & { code?: string; conflitos?: string[] }).conflitos = conflitos
      throw error
    }

    const horario = `${data.horarioInicio}-${data.horarioFim}`
    const datasParaCriar = datasValidas.filter((date) => !datasComConflito.has(toDateKey(date)))

    if (datasParaCriar.length === 0) {
      throw new Error('Todas as datas previstas possuem conflito. Nenhuma reserva foi criada.')
    }

    const serieId = randomUUID()
    const reservas = datasParaCriar.map((date, index) =>
      new Reserva({
        professorId: data.professorId,
        salaId: data.classId,
        data: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0),
        horario,
        horarioInicio: data.horarioInicio,
        horarioFim: data.horarioFim,
        turma: data.turma.trim(),
        periodo: inferPeriodo(data.horarioInicio),
        semestre: semestre.code,
        serieId,
        serieTotal: datasParaCriar.length,
        serieOrdem: index + 1,
      })
    )

    const created = await this.reservaRepository.createMany(reservas)
    if (created.length > 1 && this.notificationService?.notifyNewReservationSeries) {
      void this.notificationService.notifyNewReservationSeries(created)
    } else {
      created.forEach((reserva) => {
        void this.notificationService?.notifyNewReservation(reserva)
      })
    }

    return {
      reservas: created,
      total: created.length,
      semestre: semestre.name,
      datasIgnoradas: datasGeradas
        .filter((date) => !datasValidas.some((validDate) => toDateKey(validDate) === toDateKey(date)))
        .map((date) => ({ data: toDateKey(date), motivo: isBlockedAcademicDate(date) ?? 'Data bloqueada' }))
        .concat(
          data.ignorarConflitos
            ? conflitos.map((date) => ({ data: date, motivo: 'Conflito de reserva' }))
            : []
        ),
    }
  }
}
