import { Router } from "express";
import { ReservaController } from "../controllers/reservaController";
import { ensureAuthenticated, ensureRole } from "../middlewares/authMiddleware";

const reservaRoutes = Router();
const reservaController = new ReservaController();

// ── ROTAS ESPECÍFICAS (devem vir ANTES das rotas com :id) ──

// Coordenador: consultar intervalo em que professor não pode reservar
reservaRoutes.get(
  "/periodo-inativo-professor",
  ensureAuthenticated,
  ensureRole('COORDENADOR'),
  (req, res) => reservaController.obterPeriodoInativoProfessor(req, res)
);

// Coordenador: definir ou atualizar intervalo em que professor não pode reservar
reservaRoutes.put(
  "/periodo-inativo-professor",
  ensureAuthenticated,
  ensureRole('COORDENADOR'),
  (req, res) => reservaController.definirPeriodoInativoProfessor(req, res)
);

// Coordenador: remover bloqueio ativo
reservaRoutes.delete(
  "/periodo-inativo-professor",
  ensureAuthenticated,
  ensureRole('COORDENADOR'),
  (req, res) => reservaController.removerPeriodoInativoProfessor(req, res)
);

// Professor: listar suas próprias reservas
reservaRoutes.get(
  "/minhas",
  ensureAuthenticated,
  (req, res) => reservaController.listarPorProfessor(req, res)
);

// Todos autenticados: visualizar calendário de disponibilidade
reservaRoutes.get(
  "/calendario",
  ensureAuthenticated,
  (req, res) => reservaController.calendario(req, res)
);

// ── ROTAS GENÉRICAS E COM PARÂMETROS ──

// Professor: criar reserva (autenticado)
reservaRoutes.post(
  "/semestre",
  ensureAuthenticated,
  (req, res) => reservaController.criarSemestre(req, res)
);

// Professor: criar reserva (autenticado)
reservaRoutes.post(
  "/",
  ensureAuthenticated,
  (req, res) => reservaController.criar(req, res)
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
  "/serie/:serieId/aprovar",
  ensureAuthenticated,
  ensureRole('COORDENADOR'),
  (req, res) => reservaController.aprovarSerie(req, res)
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

// Professor ou Coordenador: cancelar reserva
reservaRoutes.patch(
  "/:id/cancelar",
  ensureAuthenticated,
  (req, res) => reservaController.cancelar(req, res)
);

export { reservaRoutes };
