import { Request, Response } from "express";
import { ZodError } from "zod";

import { CreateClassUseCase } from "../../../application/use-cases/classes/createClassUseCase";
import { UpdateClassUseCase } from "../../../application/use-cases/classes/updateClassUseCase";
import { ListAllClassUseCase } from "../../../application/use-cases/classes/listAllClassUseCase";

import { prismaClient } from "../../../infrastructure/database/prisma/prismaClient";
import { PrismaClassRepository } from "../../../infrastructure/database/prisma/PrismaClassRepository";

export class ClassController {
    async create(req: Request, res: Response): Promise<void> {
        try{
            const classRepository = new PrismaClassRepository(prismaClient); 
            const createClass = new CreateClassUseCase(classRepository);

            const result = await createClass.execute(req.body);

            res.status(201).json(result);
        } catch(error) {
            if(error instanceof ZodError) {
                res.status(400).json({ message: 'Dados inválidos.', errors: error.flatten().fieldErrors })
            }
            res.status(500).json({ message: 'Erro interno do servidor.'});
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const classRepository = new PrismaClassRepository(prismaClient); 
            const updateClass = new UpdateClassUseCase(classRepository);

            const id = req.params.id;

            const result = await updateClass.execute({id, data: req.body});

            res.status(200).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ message: 'Dados inválidos.', errors: error.flatten().fieldErrors });
                return;
            }

            if (error instanceof Error && error.message === 'Sala não encontrada') {
                res.status(404).json({ message: error.message });
                return;
            }

            res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    async listAll(req: Request, res: Response): Promise<void> {
        try {
            const classRepository = new PrismaClassRepository(prismaClient); 
            const listAllClasses = new ListAllClassUseCase(classRepository);

            const list = await listAllClasses.execute();

            res.status(200).json(list);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ message: 'Dados inválidos.', errors: error.flatten().fieldErrors });
                return;
            }

            res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }
}