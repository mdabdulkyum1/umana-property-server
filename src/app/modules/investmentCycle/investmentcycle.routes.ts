import express from "express";
import { investmentCycleController, assignPaidPaymentsToCycle } from "./investmentcycle.controller";

import { investmentCycleValidation } from "./investmentcycle.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = express.Router();

router.post(
  "/create",
  auth(Role.ADMIN),
  validateRequest(investmentCycleValidation.create),
  investmentCycleController.createCycle
);

router.get("/", auth(Role.ADMIN), investmentCycleController.getAllCycles);
router.get("/:id", auth(Role.ADMIN), investmentCycleController.getCycleById);

router.patch(
  "/update/:id",
  auth(Role.ADMIN),
  validateRequest(investmentCycleValidation.update),
  investmentCycleController.updateCycle
);

router.delete("/:id", auth(Role.ADMIN), investmentCycleController.deleteCycle);
router.patch("/mark-invested/:id", auth(Role.ADMIN), investmentCycleController.markAsInvested);

router.post(
  "/distribute/:id",
  auth(Role.ADMIN),
  validateRequest(investmentCycleValidation.distribute),
  investmentCycleController.distributeProfit
);

// Assign all (or a list of) paid, unassigned payments into a cycle
router.post(
  "/assign-paid/:id",
  auth(Role.ADMIN),
  assignPaidPaymentsToCycle
);

export const investmentCycleRoutes = router;
