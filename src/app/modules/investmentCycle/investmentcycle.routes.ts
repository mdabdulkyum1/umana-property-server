import express from "express";
import { investmentCycleController, assignPaidPaymentsToCycle } from "./investmentcycle.controller";

import { investmentCycleValidation } from "./investmentcycle.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = express.Router();

router.use(auth(Role.ADMIN));

router.post(
  "/",
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
  investmentCycleController.distributeProfit
);


router.post(
  "/assign-paid/:id",
  assignPaidPaymentsToCycle
);

export const investmentCycleRoutes = router;
