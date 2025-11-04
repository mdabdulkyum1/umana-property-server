import prisma from "../../lib/prisma";
import { IInvestmentCycleCreate, IInvestmentCycleUpdate } from "./investmentcycle.interface";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

class InvestmentCycleService {
  // ✅ Create new investment cycle
  async createCycle(payload: IInvestmentCycleCreate) {
    const cycle = await prisma.investmentCycle.create({
      data: {
        name: payload.name,
        startDate: payload.startDate || new Date(),
        endDate: payload.endDate,
      },
    });
    return cycle;
  }

  // ✅ Get all cycles
  async getAllCycles() {
    const cycles = await prisma.investmentCycle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        payments: true,
      },
    });
    return cycles;
  }

  // ✅ Get single cycle by ID
  async getCycleById(id: string) {
    const cycle = await prisma.investmentCycle.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });
    if (!cycle) throw new ApiError(httpStatus.NOT_FOUND, "Cycle not found");
    return cycle;
  }

  // ✅ Update investment cycle
  async updateCycle(id: string, payload: IInvestmentCycleUpdate) {
    const updated = await prisma.investmentCycle.update({
      where: { id },
      data: payload,
    });
    return updated;
  }

  // ✅ Delete investment cycle
  async deleteCycle(id: string) {
    const deleted = await prisma.investmentCycle.delete({
      where: { id },
    });
    return deleted;
  }

  // ✅ Mark cycle as invested
  async markAsInvested(id: string) {
    const cycle = await prisma.investmentCycle.update({
      where: { id },
      data: { isInvested: true },
    });
    return cycle;
  }

  // ✅ Distribute profit among users (example logic)
  async distributeProfit(id: string, totalProfit: number) {
    const cycle = await prisma.investmentCycle.findUnique({
      where: { id },
      include: { payments: true },
    });
    if (!cycle) throw new ApiError(httpStatus.NOT_FOUND, "Cycle not found");

    const totalDeposit = cycle.payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalDeposit === 0) throw new ApiError(httpStatus.BAD_REQUEST, "No deposits found");

    // Each user's profit = (userDeposit / totalDeposit) * totalProfit
    for (const payment of cycle.payments) {
      const userProfit = (payment.amount / totalDeposit) * totalProfit;
      await prisma.payment.update({
        where: { id: payment.id },
        data: { fine: payment.fine + userProfit },
      });
    }

    const updatedCycle = await prisma.investmentCycle.update({
      where: { id },
      data: {
        totalProfit,
        distributed: true,
      },
    });

    return updatedCycle;
  }
}

export const investmentCycleService = new InvestmentCycleService();
