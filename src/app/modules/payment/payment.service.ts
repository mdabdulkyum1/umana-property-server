import prisma from "../../lib/prisma";

class PaymentService {
  // Create a payment
  async createPayment(payload: {
    userId: string;
    cycleId?: string;
    amount: number;
    paymentMethod?: string;
  }) {
    const payment = await prisma.payment.create({
      data: {
        userId: payload.userId,
        cycleId: payload.cycleId,
        amount: payload.amount,
        paymentMethod: payload.paymentMethod,
        isPaid: true,
      },
    });

    // Update cycle totalDeposit
    if (payload.cycleId) {
      await prisma.investmentCycle.update({
        where: { id: payload.cycleId },
        data: { totalDeposit: { increment: payload.amount } },
      });
    }

    return payment;
  }

  // Get all payments
  async getAllPayments() {
    return await prisma.payment.findMany({
      include: {
        user: true,
        cycle: true,
      },
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

  // Update payment (fine or status)
  async updatePayment(id: string, data: Partial<{ fine: number; isPaid: boolean }>) {
    const updated = await prisma.payment.update({
      where: { id },
      data,
    });
    return updated;
  }

  // Delete a payment
  async deletePayment(id: string) {
    await prisma.payment.delete({ where: { id } });
    return { message: "Payment deleted successfully" };
  }
}

export const paymentService = new PaymentService();
