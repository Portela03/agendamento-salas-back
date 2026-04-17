import { Prisma } from "@prisma/client";
import { Reserva } from "../../../domain/reserva/reserva.entity";
import { CalendarioFiltros, ReservaRepository } from "../../../domain/reserva/reserva-repository.interface";
import { ReservaStatus } from "../../../domain/reserva/reserva-status.enum";
import { prismaClient } from "../prisma/prismaClient";

const prisma = prismaClient;

type ReservaWithRelations = Prisma.ReservaGetPayload<{
  include: {
    professor: { select: { name: true } };
    class: { select: { name: true } };
  };
}>;

export class PrismaReservaRepository implements ReservaRepository {
  private toMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number);
    if (
      !Number.isInteger(h) ||
      !Number.isInteger(m) ||
      h < 0 || h > 23 ||
      m < 0 || m > 59
    ) {
      return NaN;
    }

    return h * 60 + m;
  }

  private getIntervalFromReserva(reserva: Pick<Reserva, 'horario' | 'horarioInicio' | 'horarioFim'>): {
    inicio: number;
    fim: number;
  } | null {
    const fallbackInicio = reserva.horario?.split('-')[0]?.trim() ?? '';
    const fallbackFim = reserva.horario?.split('-')[1]?.trim() ?? fallbackInicio;

    const inicioStr = (reserva.horarioInicio || fallbackInicio || '').trim();
    const fimStr = (reserva.horarioFim || fallbackFim || inicioStr).trim();

    const inicio = this.toMinutes(inicioStr);
    let fim = this.toMinutes(fimStr);

    if (Number.isNaN(inicio) || Number.isNaN(fim)) return null;

    // Registros legados podem ter apenas um horário; tratamos como slot mínimo para não perder conflito.
    if (fim <= inicio) fim = inicio + 1;

    return { inicio, fim };
  }

  private async validateRelations(professorId?: string, classId?: string): Promise<void> {
    if (!professorId) throw new Error("Professor inválido.");
    if (!classId) throw new Error("classId/salaId é obrigatório.");

    const [professor, classroom] = await Promise.all([
      prisma.user.findUnique({
        where: { id: professorId },
        select: { id: true },
      }),
      prisma.class.findUnique({
        where: { id: classId },
        select: { id: true, status: true },
      }),
    ]);

    if (!professor) throw new Error("Professor não encontrado.");
    if (!classroom) throw new Error("Sala não encontrada.");
    if (classroom.status !== "DISPONIVEL") {
      throw new Error("A sala selecionada está indisponível para reserva.");
    }
  }

  private toDomain(reserva: ReservaWithRelations): Reserva {
    return new Reserva({
      id: reserva.id,
      professorId: reserva.professorId,
      salaId: reserva.classId, // compatibilidade com domínio atual
      data: reserva.data,
      horario: reserva.horario,
      horarioInicio: reserva.horarioInicio,
      horarioFim: reserva.horarioFim,
      turma: reserva.turma,
      periodo: reserva.periodo,
      semestre: reserva.semestre,
      status: this.parseStatus(reserva.status),
      justificativa: reserva.justificativa ?? undefined,
      createdAt: reserva.createdAt,
      professorNome: reserva.professor?.name,
      salaNome: reserva.class?.name,
    });
  }

  private parseStatus(status: string): ReservaStatus {
    if (
      status === ReservaStatus.AGUARDANDO ||
      status === ReservaStatus.APROVADA ||
      status === ReservaStatus.REJEITADA
    ) {
      return status;
    }
    return ReservaStatus.AGUARDANDO;
  }

  async create(reserva: Reserva): Promise<Reserva> {
    const classId = reserva.salaId;
    
    await this.validateRelations(reserva.professorId, classId);


    const reservaCriada = await prisma.reserva.create({
      data: {
        professorId: reserva.professorId,
        classId,
        data: reserva.data,
        horario: reserva.horario,
        horarioInicio: reserva.horarioInicio,
        horarioFim: reserva.horarioFim,
        turma: reserva.turma,
        periodo: reserva.periodo,
        semestre: reserva.semestre,
        status: reserva.status,
        justificativa: reserva.justificativa ?? null,
      },
      include: {
        professor: { select: { name: true } },
        class: { select: { name: true } },
      },
    });

    return this.toDomain(reservaCriada);
  }

  async findAll(): Promise<Reserva[]> {
    const reservas = await prisma.reserva.findMany({
      include: {
        professor: { select: { name: true } },
        class: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return reservas.map((reserva) => this.toDomain(reserva));
  }

  async findByProfessor(professorId: string): Promise<Reserva[]> {
    const reservas = await prisma.reserva.findMany({
      where: { professorId },
      include: {
        professor: { select: { name: true } },
        class: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return reservas.map((reserva) => this.toDomain(reserva));
  }

  async findConflito(
    salaId: string,
    data: Date,
    horarioInicio: string,
    horarioFim: string
  ): Promise<Reserva | null> {
    if (!salaId) throw new Error("classId/salaId é obrigatório.");

    const novoInicio = this.toMinutes(horarioInicio);
    const novoFim = this.toMinutes(horarioFim);

    if (Number.isNaN(novoInicio) || Number.isNaN(novoFim)) {
      throw new Error('Horário inválido para verificação de conflito.');
    }

    const reservas = await prisma.reserva.findMany({
      where: {
        classId: salaId,
        data,
        status: { in: [ReservaStatus.APROVADA, ReservaStatus.AGUARDANDO] },
      },
      include: {
        professor: { select: { name: true } },
        class: { select: { name: true } },
      },
    });

    for (const reserva of reservas) {
      const reservaDomain = this.toDomain(reserva);
      const intervalo = this.getIntervalFromReserva(reservaDomain);
      if (!intervalo) continue;

      const sobrepoe = intervalo.inicio < novoFim && intervalo.fim > novoInicio;
      if (sobrepoe) {
        return reservaDomain;
      }
    }

    return null;
  }

  async updateStatus(id: string, status: ReservaStatus, justificativa?: string): Promise<Reserva> {
    const reservaAtualizada = await prisma.reserva.update({
      where: { id },
      data: {
        status,
        ...(justificativa !== undefined ? { justificativa } : {}),
      },
      include: {
        professor: { select: { name: true } },
        class: { select: { name: true } },
      },
    });

    return this.toDomain(reservaAtualizada);
  }

  async findByCalendario(filtros: CalendarioFiltros): Promise<Reserva[]> {
    const inicio = new Date(filtros.ano, filtros.mes - 1, 1);
    const fim = new Date(filtros.ano, filtros.mes, 1); // exclusive upper bound

    const where: Prisma.ReservaWhereInput = {
      status: filtros.incluirAguardando
        ? { in: [ReservaStatus.APROVADA, ReservaStatus.AGUARDANDO] }
        : ReservaStatus.APROVADA,
      data: { gte: inicio, lt: fim },
      ...(filtros.classId ? { classId: filtros.classId } : {}),
      ...(filtros.periodo ? { periodo: filtros.periodo } : {}),
      ...(filtros.semestre ? { semestre: filtros.semestre } : {}),
    };

    const reservas = await prisma.reserva.findMany({
      where,
      include: {
        professor: { select: { name: true } },
        class: { select: { name: true } },
      },
      orderBy: { data: "asc" },
    });

    return reservas.map((reserva) => this.toDomain(reserva));
  }
}
