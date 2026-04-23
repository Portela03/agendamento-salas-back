import { Reserva } from "../../domain/reserva/reserva.entity";
import { ReservaRepository } from "../../domain/reserva/reserva-repository.interface";
import { INotificationService } from "../notification/notification.service.interface";

interface CriarReservaRequest {
  professorId: string
  classId: string
  data: Date
  horarioInicio: string
  horarioFim: string
  turma: string
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  if (
    !Number.isInteger(h) ||
    !Number.isInteger(m) ||
    h < 0 || h > 23 ||
    m < 0 || m > 59
  ) {
    throw new Error('Horário inválido. Use o formato HH:mm.')
  }
  return h * 60 + m
}

function inferPeriodo(horarioInicio: string): string {
  const hora = Number(horarioInicio.split(':')[0])
  if (hora < 12) return 'matutino'
  if (hora < 18) return 'vespertino'
  return 'noturno'
}

function inferSemestre(data: Date): string {
  const ano = data.getFullYear()
  const semestre = data.getMonth() < 6 ? 1 : 2
  return `${ano}.${semestre}`
}

function isSameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export class CriarReservaUseCase {
  constructor(
    private reservaRepository: ReservaRepository,
    private notificationService?: INotificationService,
  ) {}

  async execute(data: CriarReservaRequest) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataReserva = new Date(data.data);
    dataReserva.setHours(0, 0, 0, 0);

    if (dataReserva < hoje) {
      throw new Error("Não é possível agendar uma reserva para uma data passada.");
    }

    const inicio = toMinutes(data.horarioInicio)
    const fim = toMinutes(data.horarioFim)
    if (inicio >= fim) {
      throw new Error('A hora de término deve ser maior que a hora de início.')
    }

    const agora = new Date()
    if (isSameDate(dataReserva, agora)) {
      const minutosAgora = agora.getHours() * 60 + agora.getMinutes()
      if (inicio <= minutosAgora) {
        throw new Error('Para o dia de hoje, o horário de início deve ser maior que o horário atual.')
      }
    }

    if (!data.turma || data.turma.trim().length === 0) {
      throw new Error('Turma é obrigatória.')
    }

    const conflito = await this.reservaRepository.findConflito(
      data.classId,
      data.data,
      data.horarioInicio,
      data.horarioFim
    );

    if (conflito) {
      if (conflito.status === "APROVADA") {
        throw new Error("Já existe uma reserva APROVADA para essa sala dentro do intervalo informado. Escolha outro horário.");
      }
      throw new Error("Já existe uma solicitação PENDENTE para essa sala dentro do intervalo informado. Aguarde a análise ou escolha outro horário.");
    }

    const horario = `${data.horarioInicio}-${data.horarioFim}`

    const reserva = new Reserva({
      professorId: data.professorId,
      salaId: data.classId, // compatibilidade com domínio atual (Reserva ainda usa salaId)
      data: data.data,
      horario,
      horarioInicio: data.horarioInicio,
      horarioFim: data.horarioFim,
      turma: data.turma.trim(),
      periodo: inferPeriodo(data.horarioInicio),
      semestre: inferSemestre(dataReserva)
    });

    const created = await this.reservaRepository.create(reserva);
    void this.notificationService?.notifyNewReservation(created);
    return created;
  }
}