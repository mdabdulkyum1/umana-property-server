import express from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = express.Router();

router.post("/", auth(Role.ADMIN), PaymentController.createPayment);
router.get("/", auth(Role.ADMIN), PaymentController.getAllPayments);
router.get("/user/:userId", auth(Role.ADMIN), PaymentController.getUserPayments);
router.patch("/:id", auth(Role.ADMIN), PaymentController.updatePayment);
router.delete("/:id", auth(Role.ADMIN), PaymentController.deletePayment);

export const PaymentRoutes = router;
