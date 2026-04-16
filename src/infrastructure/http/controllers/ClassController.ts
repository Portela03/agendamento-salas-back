import { Request, Response } from "express";
import { ZodError } from "zod";

import { CreateClassUseCase } from "../../../application/use-cases/classes/createClassUseCase";
import { UpdateClassUseCase } from "../../../application/use-cases/classes/updateClassUseCase";
import { FindByIdClassUseCase } from "../../../application/use-cases/classes/findByIdClassUseCase";
import { FindByNameClassUseCase } from "../../../application/use-cases/classes/findByNameClassUseCase";
import { ListAllClassUseCase } from "../../../application/use-cases/classes/listAllClassUseCase";
import { ListAvaiablesClassUseCase } from "../../../application/use-cases/classes/listAvaiablesClassUseCase";

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

    async findById(req: Request, res: Response): Promise<void> {
        try {
            const classRepository = new PrismaClassRepository(prismaClient); 
            const findByIdClass = new FindByIdClassUseCase(classRepository);

            const id = req.params.id;

            const result = await findByIdClass.execute(id);

            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error && error.message === 'Sala não encontrada') {
                res.status(404).json({ message: error.message });
                return;
            }

            res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    async findByName(req: Request, res: Response): Promise<void> {
        try {
            const classRepository = new PrismaClassRepository(prismaClient); 
            const findByNameClass = new FindByNameClassUseCase(classRepository);

            const name = req.params.name;

            const result = await findByNameClass.execute(name);

            res.status(200).json(result);
        } catch (error) {
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

    async listAvaiables(req:Request, res:Response): Promise<void> {
        try{
            const classRepository = new PrismaClassRepository(prismaClient);
            const listAvaiables = new ListAvaiablesClassUseCase(classRepository);

            const list = await listAvaiables.execute();

            res.status(200).json(list);
        } catch (error) {
            res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }   
}