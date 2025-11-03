import * as bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import { Role } from "@prisma/client";

class AuthService {

  async registerUser(payload: {
    name: string;
    fatherName: string;
    phone: string;
    password: string;
    email?: string;
  }) {
    const { name, fatherName, phone, password, email } = payload;

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      throw new ApiError(httpStatus.CONFLICT, "Phone number already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        fatherName,
        phone,
        password: hashedPassword,
        email,
        role: Role.USER,
      },
    });

    return {
      id: newUser.id,
      name: newUser.name,
      fatherName: newUser.fatherName,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role,
      message: "User registered successfully",
    };
  }

  async loginUser(payload: { phone: string; password: string }) {
    const { phone, password } = payload;

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect");
    }

    const accessToken = jwtHelpers.generateToken(
      {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string
    );

    return {
      id: user.id,
      name: user.name,
      fatherName: user.fatherName,
      phone: user.phone,
      email: user.email,
      image: user.image,
      role: user.role,
      accessToken,
      message: "Login successful",
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid)
      throw new ApiError(httpStatus.BAD_REQUEST, "Current password is incorrect");

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: "Password updated successfully" };
  }

  async resetPassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Password reset successfully. Please login." };
  }

}

export const authService = new AuthService();
