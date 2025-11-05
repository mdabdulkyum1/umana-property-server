import express from "express";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { getSummary, getUsersOverview } from "./dashboard.controller";

const router = express.Router();

router.get("/summary", auth(Role.ADMIN), getSummary);
router.get("/users", auth(Role.ADMIN), getUsersOverview);

export const AdminDashboardRoutes = router;


