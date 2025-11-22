import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import httpStatus from 'http-status';

class PaymentService {
 
async createPayment(userId: string, amount: number) {
  const today = new Date();
  const fine = today.getDate() > 30 ? 10 : 0; // 10% fine

  const payment = await prisma.payment.create({
    data: {
      userId,
      amount,
      isPaid: true,
      fine,
    },
  });

  let system = await prisma.systemBalance.findFirst();
  if (!system) {
    system = await prisma.systemBalance.create({ data: { balance: 0 } });
  }

  await prisma.systemBalance.update({
    where: { id: system.id },
    data: { balance: system.balance + amount },
  });

  return payment;
}

  async getAllPayments() {
    return await prisma.payment.findMany({
      include: {
        user: true,
        cycle: true,
      },
      orderBy: { paymentDate: "desc" },
    });
  }

  async myPayments(userId: string) {
    return await prisma.payment.findMany({
      where: { userId },
      include: { cycle: true },
      orderBy: { paymentDate: "desc" },
    });
  }

  // Get payments by user
  async getUserPayments(userId: string) {
    return await prisma.payment.findMany({
      where: { userId },
      include: { cycle: true },
    });
  }

  async updatePayment(
  id: string,
  data: Partial<{ amount: number; fine: number; isPaid: boolean }>
) {
  const oldPayment = await prisma.payment.findUnique({
    where: { id },
  });

  if (!oldPayment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
  }

  const updateData: {
    amount?: number;
    fine?: number;
    isPaid?: boolean;
  } = { ...data };

  let amountDiff = 0;
  if (typeof data.amount === "number") {
    amountDiff = data.amount - oldPayment.amount;
  }

  let fineToAddToBalance = 0;
  if (typeof data.fine === "number") {
    const oldFine = oldPayment.fine || 0;

    updateData.amount = (updateData.amount ?? oldPayment.amount) + oldFine;

    updateData.fine = 0;

    fineToAddToBalance = oldFine;
  }

  const totalBalanceDiff = amountDiff + fineToAddToBalance;

  if (totalBalanceDiff !== 0) {
    const system = await prisma.systemBalance.findFirst();

    if (system) {
      await prisma.systemBalance.update({
        where: { id: system.id },
        data: {
          balance: system.balance + totalBalanceDiff,
        },
      });
    }
  }

  const updated = await prisma.payment.update({
    where: { id },
    data: updateData,
  });

  return updated;
}



  async assignPaidPaymentsToCycle(cycleId: string, paymentIds?: string[]) {
    const filter = {
      isPaid: true,
      cycleId: null as any,
      ...(paymentIds && paymentIds.length ? { id: { in: paymentIds } } : {}),
    };

    const eligible = await prisma.payment.findMany({ where: filter });
    if (!eligible.length) return { assigned: 0, totalAssignedAmount: 0 };

    const amountSum = eligible.reduce((s, p) => s + p.amount, 0);

    await prisma.$transaction([
      prisma.payment.updateMany({ where: filter, data: { cycleId } }),
      prisma.investmentCycle.update({
        where: { id: cycleId },
        data: { totalDeposit: { increment: amountSum } },
      }),
    ]);

    // Ensure exact totalDeposit sync based on payments in cycle
    const aggregate = await prisma.payment.aggregate({
      where: { cycleId, isPaid: true },
      _sum: { amount: true },
    });
    await prisma.investmentCycle.update({
      where: { id: cycleId },
      data: { totalDeposit: aggregate._sum.amount ?? 0 },
    });

    return { assigned: eligible.length, totalAssignedAmount: amountSum };
  }

  async deletePayment(id: string) {
    await prisma.payment.delete({ where: { id } });
    return { message: "Payment deleted successfully" };
  }
}

export const paymentService = new PaymentService();
