import prisma from "../../lib/prisma";

class AdminDashboardService {
  async getSummary() {
    const [totalUsers, paidAgg, unassignedAgg, cyclesOpen] = await Promise.all([
      prisma.user.count(),
      prisma.payment.aggregate({ where: { isPaid: true }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { isPaid: true, cycleId: null as any }, _sum: { amount: true } }),
      prisma.investmentCycle.count({ where: { distributed: false } }),
    ]);

    const totalInCyclesAgg = await prisma.investmentCycle.aggregate({ _sum: { totalDeposit: true } });

    const systemBalance = await prisma.systemBalance.findFirst();

    return {
      totalUsers,
      totalPaidAmount: paidAgg._sum.amount ?? 0,
      totalUnassignedPaid: unassignedAgg._sum.amount ?? 0,
      totalInCycles: totalInCyclesAgg._sum.totalDeposit ?? 0,
      openCycles: cyclesOpen,
      systemBalance: systemBalance?.balance ?? 0,
    };
  }

async getUsersOverview() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      fatherName: true,
      phone: true,
      image: true,
      role: true,
      leader: true,
      createdAt: true,
    },
  });

  const paymentsByUser = await prisma.payment.groupBy({
    by: ["userId"],
    _sum: { amount: true },
    _max: { paymentDate: true },
    where: { isPaid: true },
  });

  const pendingByUser = await prisma.payment.groupBy({
    by: ["userId"],
    _count: { _all: true },
    where: { isPaid: false },
  });

  const unassignedPaidByUser = await prisma.payment.groupBy({
    by: ["userId"],
    _sum: { amount: true },
    where: { isPaid: true, cycleId: null },
  });

  const fineByUser = await prisma.payment.groupBy({
    by: ["userId"],
    _sum: { fine: true },
  });

  const sumMap = new Map(paymentsByUser.map(p => [p.userId, p._sum.amount ?? 0]));
  const lastMap = new Map(paymentsByUser.map(p => [p.userId, p._max.paymentDate ?? null]));
  const pendingMap = new Map(pendingByUser.map(p => [p.userId, p._count._all]));
  const unassignedMap = new Map(unassignedPaidByUser.map(p => [p.userId, p._sum.amount ?? 0]));
  const fineMap = new Map(fineByUser.map(p => [p.userId, p._sum.fine ?? 0]));

  return users.map(u => ({
    id: u.id,
    name: u.name,
    fatherName: u.fatherName,
    phone: u.phone,
    image: u.image,
    role: u.role,
    leader: u.leader,
    createdAt: u.createdAt,

    totalPaid: sumMap.get(u.id) ?? 0,
    pendingCount: pendingMap.get(u.id) ?? 0,
    unassignedPaid: unassignedMap.get(u.id) ?? 0,
    lastPaymentDate: lastMap.get(u.id) ?? null,

    totalFine: fineMap.get(u.id) ?? 0,
  }));
}
}

export const adminDashboardService = new AdminDashboardService();


