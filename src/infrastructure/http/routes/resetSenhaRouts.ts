import { Router } from 'express';
import { ResetSenhaController } from '../controllers/resetSenhaController';
import { ensureAuthenticated, ensureRole } from '../middlewares/authMiddleware';

const resetSenhaRouter = Router();
const resetSenhaController = new ResetSenhaController();

resetSenhaRouter.post(
    '/esqueceu-senha',
    (req, res) => resetSenhaController.sendResetPassword(req, res),  
);

resetSenhaRouter.post(
    '/reset-senha',
    (req, res) => resetSenhaController.resetPassword(req, res),  
);


//notificacaoRoutes.post('/esqueceu-senha', (req, res) => notificacaoController.sendResetPassword(req, res));
//notificacaoRoutes.post('/reset-senha', (req, res) => notificacaoController.resetPassword(req, res));


export { resetSenhaRouter }