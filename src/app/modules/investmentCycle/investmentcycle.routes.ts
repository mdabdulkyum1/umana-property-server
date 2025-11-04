import express from "express";
import { investmentCycleController } from "./investmentcycle.controller";

import { investmentCycleValidation } from "./investmentcycle.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

router.post(
  "/create",
  validateRequest(investmentCycleValidation.create),
  investmentCycleController.createCycle
);

router.get("/", investmentCycleController.getAllCycles);
router.get("/:id", investmentCycleController.getCycleById);

router.patch(
  "/update/:id",
  validateRequest(investmentCycleValidation.update),
  investmentCycleController.updateCycle
);

router.delete("/:id", investmentCycleController.deleteCycle);
router.patch("/mark-invested/:id", investmentCycleController.markAsInvested);

router.post(
  "/distribute/:id",
  validateRequest(investmentCycleValidation.distribute),
  investmentCycleController.distributeProfit
);

export const investmentCycleRoutes = router;
