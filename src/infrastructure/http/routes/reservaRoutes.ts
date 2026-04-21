import { Router } from "express";
import { ReservaController } from "../controllers/reservaController";
import { ensureAuthenticated, ensureRole } from "../middlewares/authMiddleware";

const reservaRoutes = Router();
const reservaController = new ReservaController();

// Professor: criar reserva (autenticado)
reservaRoutes.post(
  "/",
  ensureAuthenticated,
  (req, res) => reservaController.criar(req, res)
);

// Professor: listar suas próprias reservas
reservaRoutes.get(
  "/minhas",
  ensureAuthenticated,
  (req, res) => reservaController.listarPorProfessor(req, res)
);

// Coordenador: listar todas as reservas
reservaRoutes.get(
  "/",
  ensureAuthenticated,
  ensureRole('COORDENADOR'),
  (req, res) => reservaController.listar(req, res)
);

// Coordenador: aprovar reserva
reservaRoutes.patch(
  "/:id/aprovar",
  ensureAuthenticated,
  ensureRole('COORDENADOR'),
  (req, res) => reservaController.aprovar(req, res)
);

// Coordenador: rejeitar reserva
reservaRoutes.patch(
  "/:id/rejeitar",
  ensureAuthenticated,
  ensureRole('COORDENADOR'),
  (req, res) => reservaController.rejeitar(req, res)
);

// Todos autenticados: visualizar calendário de disponibilidade
reservaRoutes.get(
  "/calendario",
  ensureAuthenticated,
  (req, res) => reservaController.calendario(req, res)
);

export { reservaRoutes };