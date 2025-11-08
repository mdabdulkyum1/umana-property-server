import express from "express";
import { AuthRouters } from "../modules/auth/auth.routes";
import { UserRouters } from "../modules/user/Users.route";
import { PaymentRoutes } from "../modules/payment/payment.routes";
import { investmentCycleRoutes } from "../modules/investmentCycle/investmentcycle.routes";
import { AdminDashboardRoutes } from "../modules/dashboard/dashboard.routes";

const router = express.Router();

const moduleRoutes = [
    {
        path:"/auth",
        route: AuthRouters,
    },
    {
        path:"/users",
        route: UserRouters,
    },

    {
        path: "/payments",
        route: PaymentRoutes,
    },
    {
        path: "/investment-cycle",
        route: investmentCycleRoutes,
    },
    {
        path: "/admin/dashboard",
        route: AdminDashboardRoutes,
    },
]

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router

