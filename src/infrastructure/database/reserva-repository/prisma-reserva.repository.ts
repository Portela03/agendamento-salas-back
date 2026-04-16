import { Prisma } from "@prisma/client";
import { Reserva } from "../../../domain/reserva/reserva.entity";
import { ReservaRepository } from "../../../domain/reserva/reserva-repository.interface";
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

  async findConflito(salaId: string, data: Date, horario: string): Promise<Reserva | null> {
    if (!salaId) throw new Error("classId/salaId é obrigatório.");

    const reserva = await prisma.reserva.findFirst({
      where: {
        classId: salaId,
        data,
        horario,
        status: { in: [ReservaStatus.APROVADA, ReservaStatus.AGUARDANDO] },
      },
      include: {
        professor: { select: { name: true } },
        class: { select: { name: true } },
      },
    });

    return reserva ? this.toDomain(reserva) : null;
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
}