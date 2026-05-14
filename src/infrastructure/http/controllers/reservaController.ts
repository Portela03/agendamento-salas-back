import { Request, Response } from "express";

import { PrismaReservaRepository } from "../../database/reserva-repository/prisma-reserva.repository";

import { CriarReservaUseCase } from "../../../application/reserva-usecases/criar-reserva.usecase";
import { ListarReservasUseCase } from "../../../application/reserva-usecases/listar-reservas.usecase";
import { ListarReservasProfessorUseCase } from "../../../application/reserva-usecases/listar-reservas-professor.usecase";
import { AprovarReservaUseCase } from "../../../application/reserva-usecases/aprovar-reserva.usecase";
import { RejeitarReservaUseCase } from "../../../application/reserva-usecases/rejeitar-reserva.usecase";
import { ListarReservasCalendarioUseCase } from "../../../application/reserva-usecases/listar-reservas-calendario.usecase";
import { CancelarReservaUseCase } from "../../../application/reserva-usecases/cancelar-reserva.usecase";
import {
  DefinirPeriodoInativoProfessorUseCase,
  ObterPeriodoInativoProfessorUseCase,
  RemoverPeriodoInativoProfessorUseCase,
} from "../../../application/reserva-usecases/gerenciar-periodo-inativo-professor.usecase";
import { notificationService } from "../../notification/notification.singleton";
import { prismaClient } from "../../database/prisma/prismaClient";
import { PrismaPeriodoInativoProfessorRepository } from "../../database/prisma/PrismaPeriodoInativoProfessorRepository";

const reservaRepository = new PrismaReservaRepository();
const periodoInativoProfessorRepository = new PrismaPeriodoInativoProfessorRepository(prismaClient);

export class ReservaController {

  async criar(request: Request, response: Response) {
    try {
      const { classId, salaId, data, horarioInicio, horarioFim, turma } = request.body;

      const resolvedClassId = classId ?? salaId; // compatibilidade legado
      if (!resolvedClassId) {
        return response.status(400).json({ message: "classId é obrigatório." });
      }

      const professorId = request.user!.id;
      const useCase = new CriarReservaUseCase(
        reservaRepository,
        periodoInativoProfessorRepository,
        notificationService,
      );

      const reserva = await useCase.execute({
        professorId,
        professorRole: request.user!.role,
        classId: resolvedClassId,
        data: new Date(data),
        horarioInicio,
        horarioFim,
        turma,
      });

      return response.status(201).json(reserva);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: "Erro interno do servidor." });
    }
  }

  async listar(request: Request, response: Response) {
    try {
      const useCase = new ListarReservasUseCase(reservaRepository);
      const reservas = await useCase.execute();
      return response.json(reservas);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async listarPorProfessor(request: Request, response: Response) {
    try {
      const professorId = request.user!.id;
      const useCase = new ListarReservasProfessorUseCase(reservaRepository);
      const reservas = await useCase.execute(professorId);
      return response.json(reservas);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async aprovar(request: Request, response: Response) {
    try {
      const { id } = request.params;

      const useCase = new AprovarReservaUseCase(reservaRepository, notificationService);
      const reserva = await useCase.execute(id);

      return response.json(reserva);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async rejeitar(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const { justificativa } = request.body;

      if (!justificativa || String(justificativa).trim().length === 0) {
        return response.status(400).json({ message: 'A justificativa é obrigatória.' });
      }

      const useCase = new RejeitarReservaUseCase(reservaRepository, notificationService);
      const reserva = await useCase.execute(id, String(justificativa));

      return response.json(reserva);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async calendario(request: Request, response: Response) {
    try {
      const { mes, ano, classId, periodo, semestre, incluirAguardando } = request.query;

      const mesNum = Number(mes);
      const anoNum = Number(ano);

      if (!mesNum || !anoNum || mesNum < 1 || mesNum > 12) {
        return response.status(400).json({ message: 'Parâmetros mes e ano são obrigatórios (mes: 1-12).' });
      }

      const useCase = new ListarReservasCalendarioUseCase(reservaRepository);
      const reservas = await useCase.execute({
        mes: mesNum,
        ano: anoNum,
        classId: classId as string | undefined,
        periodo: periodo as string | undefined,
        semestre: semestre as string | undefined,
        incluirAguardando: incluirAguardando === 'true',
      });

      return response.json(reservas);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async obterPeriodoInativoProfessor(_request: Request, response: Response) {
    try {
      const useCase = new ObterPeriodoInativoProfessorUseCase(periodoInativoProfessorRepository);
      const periodo = await useCase.execute();

      return response.json(periodo);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async definirPeriodoInativoProfessor(request: Request, response: Response) {
    try {
      const { dataInicio, dataFim } = request.body;
      const useCase = new DefinirPeriodoInativoProfessorUseCase(periodoInativoProfessorRepository);

      const periodo = await useCase.execute({
        dataInicio,
        dataFim,
      });

      return response.status(200).json(periodo);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async removerPeriodoInativoProfessor(_request: Request, response: Response) {
    try {
      const useCase = new RemoverPeriodoInativoProfessorUseCase(periodoInativoProfessorRepository);
      await useCase.execute();

      return response.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  async cancelar(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const usuarioId = request.user!.id;
      const isCoordenador = request.user!.role === "COORDENADOR";

      const useCase = new CancelarReservaUseCase(
        reservaRepository,
      );

      const reserva = await useCase.execute(
        id,
        usuarioId,
        isCoordenador,
      );

      return response.json(reserva);
    } catch (error) {
      if (error instanceof ApiError) {
        return response.status(error.status).json({ code: error.code, message: error.message });
      }
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
}