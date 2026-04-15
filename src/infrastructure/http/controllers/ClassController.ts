import { Request, Response } from "express";
import { ZodError } from "zod";

import { CreateClassUseCase } from "@application/use-cases/classes/createClassUseCase";

import { prismaClient } from "@infrastructure/database/prisma/prismaClient";
import { PrismaClassRepository } from "@infrastructure/database/prisma/PrismaClassRepository";

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
}