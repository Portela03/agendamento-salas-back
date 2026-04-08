import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const authRouter = Router();
const authController = new AuthController();

/**
 * POST /api/auth/login
 * Public endpoint — no authentication required.
 */
authRouter.post('/login', (req, res) => authController.login(req, res));

export { authRouter };
