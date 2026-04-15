import { Router } from 'express';
import { ClassController } from '../controllers/ClassController';
import { ensureAuthenticated, ensureRole } from '../middlewares/authMiddleware';

const  classRouter = Router();
const classController = new ClassController();

classRouter.post(
    '/',
    ensureAuthenticated,
    (req, res) => classController.create(req, res),  
);

export { classRouter }