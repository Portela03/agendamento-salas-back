import { Router } from 'express';
import { ResetSenhaController } from '../controllers/resetSenhaController';

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



export { resetSenhaRouter }