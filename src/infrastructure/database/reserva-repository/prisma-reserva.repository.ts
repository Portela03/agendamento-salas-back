import { Reserva } from "../../../domain/reserva/reserva.entity";
import { ReservaRepository } from "../../../domain/reserva/reserva-repository.interface";
import { ReservaStatus } from "../../../domain/reserva/reserva-status.enum";
import { prismaClient } from "../prisma/prismaClient";

const prisma = prismaClient;

export class PrismaReservaRepository implements ReservaRepository {

  private async validateRelations(professorId: string, salaId: string): Promise<void> {
    const [professor, sala] = await Promise.all([
      prisma.user.findUnique({
        where: { id: professorId },
        select: { id: true },
      }),
      prisma.sala.findUnique({
        where: { id: salaId },
        select: { id: true },
      }),
    ]);

    if (!professor) {
      throw new Error('Professor não encontrado.');
    }

    if (!sala) {
      throw new Error('Sala não encontrada.');
    }
  }

  private toDomain(reserva: {
    id: string;
    professorId: string;
    salaId: string;
    data: Date;
    horario: string;
    periodo: string;
    semestre: string;
    status: string;
    createdAt: Date;
  }): Reserva {
    return new Reserva({
      id: reserva.id,
      professorId: reserva.professorId,
      salaId: reserva.salaId,
      data: reserva.data,
      horario: reserva.horario,
      periodo: reserva.periodo,
      semestre: reserva.semestre,
      status: this.parseStatus(reserva.status),
      createdAt: reserva.createdAt
    });
  }

  private parseStatus(status: string): ReservaStatus {
    if (status === ReservaStatus.AGUARDANDO || status === ReservaStatus.APROVADA || status === ReservaStatus.REJEITADA) {
      return status;
    }

    return ReservaStatus.AGUARDANDO;
  }

  async create(reserva: Reserva): Promise<Reserva> {
    await this.validateRelations(reserva.professorId, reserva.salaId);

    const reservaCriada = await prisma.reserva.create({
      data: {
        professorId: reserva.professorId,
        salaId: reserva.salaId,
        data: reserva.data,
        horario: reserva.horario,
        periodo: reserva.periodo,
        semestre: reserva.semestre,
        status: reserva.status
      }
    });

    return this.toDomain(reservaCriada);
  }


  async findAll(): Promise<Reserva[]> {
    const reservas = await prisma.reserva.findMany({
      include: {
        professor: true,
        sala: true
      }
    });

    return reservas.map((reserva) => this.toDomain(reserva));
  }


  async findByProfessor(professorId: string): Promise<Reserva[]> {
    const reservas = await prisma.reserva.findMany({
      where: {
        professorId
      },
      include: {
        sala: true
      }
    });

    return reservas.map((reserva) => this.toDomain(reserva));
  }


  async findConflito(
    salaId: string,
    data: Date,
    horario: string
  ): Promise<Reserva | null> {

    const reserva = await prisma.reserva.findFirst({
      where: {
        salaId,
        data,
        horario,
        status: ReservaStatus.APROVADA
      }
    });

    if (!reserva) {
      return null;
    }

    return this.toDomain(reserva);
  }


  async updateStatus(
    id: string,
    status: ReservaStatus
  ): Promise<Reserva> {

    const reservaAtualizada = await prisma.reserva.update({
      where: {
        id
      },
      data: {
        status
      }
    });

    return this.toDomain(reservaAtualizada);
  }

}