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

classRouter.patch(
    '/:id',
    ensureAuthenticated,
    (req, res) => classController.update(req, res),
)

classRouter.get(
    '/',
    ensureAuthenticated,
    (req, res) => classController.listAll(req, res),
)

classRouter.get(
    '/avaiables',
    ensureAuthenticated,
    (req, res) => classController.listAvaiables(req, res),
)

classRouter.get(
    '/:id',
    ensureAuthenticated,
    (req, res) => classController.findById(req, res),
)

export { classRouter }