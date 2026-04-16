import { Request, Response } from "express";

import { PrismaReservaRepository } from "../../database/reserva-repository/prisma-reserva.repository";

import { CriarReservaUseCase } from "../../../application/reserva-usecases/criar-reserva.usecase";
import { ListarReservasUseCase } from "../../../application/reserva-usecases/listar-reservas.usecase";
import { ListarReservasProfessorUseCase } from "../../../application/reserva-usecases/listar-reservas-professor.usecase";
import { AprovarReservaUseCase } from "../../../application/reserva-usecases/aprovar-reserva.usecase";
import { RejeitarReservaUseCase } from "../../../application/reserva-usecases/rejeitar-reserva.usecase";

const reservaRepository = new PrismaReservaRepository();

export class ReservaController {

  async criar(request: Request, response: Response) {
    try {
      const { classId, salaId, data, horario, periodo, semestre } = request.body;

      const resolvedClassId = classId ?? salaId; // compatibilidade legado
      if (!resolvedClassId) {
        return response.status(400).json({ message: "classId é obrigatório." });
      }

      const professorId = request.user!.id;
      const useCase = new CriarReservaUseCase(reservaRepository);

      const reserva = await useCase.execute({
        professorId,
        classId: resolvedClassId,
        data: new Date(data),
        horario,
        periodo,
        semestre,
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

      const useCase = new AprovarReservaUseCase(reservaRepository);
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

      const useCase = new RejeitarReservaUseCase(reservaRepository);
      const reserva = await useCase.execute(id, String(justificativa));

      return response.json(reserva);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

}