import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { ensureAuthenticated, ensureRole } from '../middlewares/authMiddleware';

const userRouter = Router();
const userController = new UserController();

// Public registration (always created as PENDENTE and must be approved)
userRouter.post('/register', (req, res) => userController.register(req, res));

/**
 * POST /api/users
 * Protected endpoint — only COORDENADOR may create users.
 */
userRouter.post(
  '/',
  ensureAuthenticated,
  ensureRole('COORDENADOR'),
  (req, res) => userController.create(req, res),
);

// Coordenador approval flows
userRouter.get(
  '/pending',
  ensureAuthenticated,
  ensureRole('COORDENADOR'),
  (req, res) => userController.listPending(req, res),
);

userRouter.patch(
  '/:id/approve',
  ensureAuthenticated,
  ensureRole('COORDENADOR'),
  (req, res) => userController.approve(req, res),
);

export { userRouter };
