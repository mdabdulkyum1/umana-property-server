import prisma from "../../lib/prisma";
import { IInvestmentCycleCreate, IInvestmentCycleUpdate } from "./investmentcycle.interface";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

class InvestmentCycleService {
  async createCycle(payload: IInvestmentCycleCreate) {
  // Step 1️⃣: Create the new cycle
  const cycle = await prisma.investmentCycle.create({
    data: {
      name: payload.name,
      startDate: payload.startDate || new Date(),
      endDate: payload.endDate,
      isInvested: payload.isInvested || false,
    },
  });

  // Step 2️⃣: Find all paid payments not yet assigned to any cycle
  const unpaidLinkedPayments = await prisma.payment.findMany({
    where: {
      isPaid: true,
      cycleId: null, // only unlinked payments
    },
  });

  console.log("unpaidLinkedPayments", unpaidLinkedPayments);

  // Step 3️⃣: Attach them to the new cycle
  if (unpaidLinkedPayments.length > 0) {
    await prisma.payment.updateMany({
      where: {
        id: { in: unpaidLinkedPayments.map((p) => p.id) },
      },
      data: { cycleId: cycle.id },
    });

    // Step 4️⃣: Calculate total deposit for this cycle
    const totalDeposit = unpaidLinkedPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    // Step 5️⃣: Update the cycle with the total deposit amount
    await prisma.investmentCycle.update({
      where: { id: cycle.id },
      data: { totalDeposit },
    });
  }

  // Step 6️⃣: Return cycle with linked payments info
  const updatedCycle = await prisma.investmentCycle.findUnique({
    where: { id: cycle.id },
    include: { payments: true },
  });

  return {
    message:
      unpaidLinkedPayments.length > 0
        ? `Cycle created and linked ${unpaidLinkedPayments.length} payments.`
        : "Cycle created but no paid payments were available to link.",
    cycle: updatedCycle,
  };
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
