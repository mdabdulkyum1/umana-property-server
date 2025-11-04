import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

class InvestmentService {
  async createCycle(payload: { name: string }) {
    return prisma.investmentCycle.create({
      data: { name: payload.name },
    });
  }

  async getAllCycles() {
    return prisma.investmentCycle.findMany({
      include: { payments: true },
      orderBy: { startDate: "desc" },
    });
  }

  async getCycleById(id: string) {
    return prisma.investmentCycle.findUnique({
      where: { id },
      include: { payments: true },
    });
  }

  // 💰 Profit Distribution Logic
  async distributeProfit(cycleId: string, totalProfit: number) {
    const cycle = await prisma.investmentCycle.findUnique({
      where: { id: cycleId },
      include: { payments: true },
    });

    if (!cycle) throw new ApiError(httpStatus.NOT_FOUND, "Cycle not found");
    if (cycle.distributed)
      throw new ApiError(httpStatus.BAD_REQUEST, "Profit already distributed");

    const payments = cycle.payments.filter((p) => p.isPaid);
    if (payments.length === 0)
      throw new ApiError(httpStatus.BAD_REQUEST, "No paid users in this cycle");

    const totalDeposit = payments.reduce((sum, p) => sum + p.amount, 0);

    const profitRecords = payments.map((p) => {
      const profitAmount = (p.amount / totalDeposit) * totalProfit;
      return {
        cycleId,
        userId: p.userId,
        amount: profitAmount,
      };
    });

    // Save all profits
    await prisma.$transaction([
      prisma.profitDistribution.createMany({ data: profitRecords }),
      prisma.investmentCycle.update({
        where: { id: cycleId },
        data: { totalProfit, distributed: true },
      }),
    ]);

    return {
      message: "Profit distributed successfully",
      totalProfit,
      totalUsers: payments.length,
      profitRecords,
    };
  }

  async deleteCycle(id: string) {
    return prisma.investmentCycle.delete({ where: { id } });
  }
}

export const investmentService = new InvestmentService();
