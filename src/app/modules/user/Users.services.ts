import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";

interface updataData {
  name: string;
  phone: string;
  email: string;
}

class UserService {
 
  async getMyProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        fatherName: true,
        phone: true,
        email: true,
        image: true,
        role: true,
        leader: true,
        createdAt: true,
      },
    });

    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    return user;
  }

  async updateMyProfile(userId: string, payload: any) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: payload,
      select: {
        id: true,
        name: true,
        fatherName: true,
        phone: true,
        email: true,
        image: true,
        role: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async updateProfileImage(userId: string, image: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { image },
    select: {
      id: true,
      image: true,
    },
  });

  return user;
}

  async deleteUser(userId: string) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existingUser)
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: "User deleted successfully" };
  }

async getAllUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      phone: true,
      role: true,
      leader:true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const usersWithPaymentFlag = await Promise.all(
    users.map(async (user) => {
      const paymentCount = await prisma.payment.count({
        where: {
          userId: user.id,
          paymentDate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const userData = {
        ...user,
        hasPayment: paymentCount > 0, 
      };

      return userData;
    })
  );

  return usersWithPaymentFlag;
}

async makeLeader(id: string) {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      leader: !existingUser.leader,
    },
  });

  return updatedUser;
}


async updateUserByAdmin(id: string, payload: updataData){

   const existingUser = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!existingUser) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: payload,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        updatedAt: true,
      },
    });

    return updatedUser;

}

 async getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      payments: true, 
    },
  });

  return user;
}
}

export const userService = new UserService();
