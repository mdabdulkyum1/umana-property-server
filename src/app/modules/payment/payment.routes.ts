import express from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = express.Router();

router.use(auth(Role.ADMIN, Role.USER));

router.post("/", PaymentController.createPayment);
router.get("/", PaymentController.getAllPayments);
router.get("/user/:userId", PaymentController.getUserPayments);
router.patch("/:id", PaymentController.updatePayment);
router.delete("/:id", PaymentController.deletePayment);

export const PaymentRoutes = router;
  