import prisma from "../../lib/prisma";
import { IInvestmentCycleCreate, IInvestmentCycleUpdate } from "./investmentcycle.interface";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

class InvestmentCycleService {
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

  async getAllCycles() {
    const cycles = await prisma.investmentCycle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        payments: true,
      },
    });
    return cycles;
  }

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

 async updateCycle(id: string, payload: IInvestmentCycleUpdate) {
    const cycle = await prisma.investmentCycle.findUnique({ where: { id } });
    if (!cycle) throw new ApiError(httpStatus.NOT_FOUND, "Cycle not found");

    // totalDeposit দিলে system balance থেকে minus
    if (payload.totalDeposit && payload.totalDeposit > 0) {
      const system = await prisma.systemBalance.findFirst();
      if (!system || system.balance < payload.totalDeposit) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient system balance");
      }

      await prisma.systemBalance.update({
        where: { id: system.id },
        data: { balance: system.balance - payload.totalDeposit },
      });
    }

    // totalProfit দিলে system balance বাড়বে
    if (payload.totalProfit && payload.totalProfit > 0) {
      const system = await prisma.systemBalance.findFirst();
      if (!system) throw new ApiError(httpStatus.BAD_REQUEST, "System balance not found");

      await prisma.systemBalance.update({
        where: { id: system.id },
        data: { balance: system.balance + payload.totalProfit },
      });
    }

    return prisma.investmentCycle.update({
      where: { id },
      data: payload,
    });
  }


  async deleteCycle(id: string) {
    const deleted = await prisma.investmentCycle.delete({
      where: { id },
    });
    return deleted;
  }

  async markAsInvested(id: string) {
    const cycle = await prisma.investmentCycle.update({
      where: { id },
      data: { isInvested: true },
    });
    return cycle;
  }

  async distributeProfit(id: string) {
    const cycle = await prisma.investmentCycle.findUnique({
      where: { id },
      include: { payments: true },
    });
    if (!cycle) throw new ApiError(httpStatus.NOT_FOUND, "Cycle not found");
    if (cycle.distributed) throw new ApiError(httpStatus.BAD_REQUEST, "Profit already distributed");

    const totalDeposit = cycle.payments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0);
    if (totalDeposit === 0) throw new ApiError(httpStatus.BAD_REQUEST, "No deposits found");

    const profitRecords = cycle.payments
      .filter(p => p.isPaid)
      .map(p => ({
        cycleId: id,
        userId: p.userId,
        amount: (p.amount / totalDeposit) * cycle.totalProfit,
      }));

    const system = await prisma.systemBalance.findFirst();
    if (!system || system.balance < cycle.totalProfit) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient system balance for profit distribution");
    }

    await prisma.$transaction([
      prisma.profitDistribution.createMany({ data: profitRecords }),
      prisma.systemBalance.update({
        where: { id: system.id },
        data: { balance: system.balance - cycle.totalProfit },
      }),
      prisma.investmentCycle.update({
        where: { id },
        data: { distributed: true },
      }),
    ]);

    return { message: "Profit distributed successfully", profitRecords };
  }

  async getSystemBalance() {
    let system = await prisma.systemBalance.findFirst();
    if (!system) system = await prisma.systemBalance.create({ data: { balance: 0 } });
    return system;
  }
}

export const investmentCycleService = new InvestmentCycleService();
