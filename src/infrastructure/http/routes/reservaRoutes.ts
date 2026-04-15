import { Router } from "express";
import { ReservaController } from "../controllers/reservaController";

const reservaRoutes = Router();
const reservaController = new ReservaController();

// ✅ agora é só "/"
reservaRoutes.post("/", (req, res) =>
  reservaController.criar(req, res)
);

reservaRoutes.get("/", (req, res) =>
  reservaController.listar(req, res)
);

reservaRoutes.patch("/:id/aprovar", (req, res) =>
  reservaController.aprovar(req, res)
);

reservaRoutes.patch("/:id/rejeitar", (req, res) =>
  reservaController.rejeitar(req, res)
);

export { reservaRoutes };