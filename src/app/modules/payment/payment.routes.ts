import express from "express";
import { PaymentController } from "./payment.controller";

const router = express.Router();

router.post("/", PaymentController.createPayment);
router.get("/", PaymentController.getAllPayments);
router.get("/user/:userId", PaymentController.getUserPayments);
router.patch("/:id", PaymentController.updatePayment);
router.delete("/:id", PaymentController.deletePayment);

export const PaymentRoutes = router;
