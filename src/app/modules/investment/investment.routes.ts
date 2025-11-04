import express from "express";
import { InvestmentController } from "./investment.controller";

const router = express.Router();

router.post("/", InvestmentController.createCycle);
router.get("/", InvestmentController.getAllCycles);
router.get("/:id", InvestmentController.getCycleById);
router.post("/distribute", InvestmentController.distributeProfit);
router.delete("/:id", InvestmentController.deleteCycle);

export const InvestmentRoutes = router;
