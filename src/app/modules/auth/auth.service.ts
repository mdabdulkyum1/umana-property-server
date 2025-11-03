import * as bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import { Role } from "@prisma/client";
import { emailTemplate } from "../../utils/emailNotifications/emailHTML";
import { OTPFn } from "./OTPFn";
import { forgotEmailTemplate } from "../../utils/emailNotifications/forgotHTML";
import { welcomeEmailTemplate } from "../../utils/emailNotifications/welcomeHTML";
import sentEmailUtility from "../../utils/sentEmailUtility";

// Interfaces for referral system
interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  referralCode?: string; // Optional referral code from referrer
}

interface IUserLogin {
  email: string;
  password: string;
}

interface IChangePassword {
  oldPassword: string;
  newPassword: string;
}

interface IOtpVerification {
  userId: string;
  otpCode: string;
  type: string;
}

class AuthService {
  // Generate unique referral code
  private generateReferralCode(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `REF${timestamp}${randomStr}`;
  }

  // Register new user with referral system
  async registerUser(payload: IRegisterUser) {
  const { name, email, password, referralCode } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "This email is already registered"
    );
  }


  const hashedPassword = await bcrypt.hash(password, 12);

  const userReferralCode = this.generateReferralCode();

  const user = await prisma.$transaction(async (tx) => {

    const newUser = await tx.user.create({
      data: {
        name,
        email: email.trim(),
        password: hashedPassword,
        referralCode: userReferralCode,
        role: Role.USER,
        isEmailVerified: false,
        credits: 0,
      },
    });

    await tx.dashboard.create({
      data: {
        userId: newUser.id,
        referredUsers: 0,
        convertedUsers: 0,
        totalCredits: 0,
      },
    });

    if (referralCode) {
      const referrer = await tx.user.findUnique({
        where: { referralCode },
      });

      if (referrer && referrer.id !== newUser.id) {
        const existingReferral = await tx.referral.findUnique({
          where: {
            referrerId_referredId: {
              referrerId: referrer.id,
              referredId: newUser.id,
            },
          },
        });

        if (!existingReferral) {
          await tx.referral.create({
            data: {
              referrerId: referrer.id,
              referredId: newUser.id,
              referralCode,
              status: "PENDING",
            },
          });

          await tx.dashboard.update({
            where: { userId: referrer.id },
            data: {
              referredUsers: { increment: 1 },
            },
          });
        }
      }
    }

    return newUser;
  });

  try {
    await OTPFn(email, user.id, "email Verification", emailTemplate);
  } catch (error) {
    console.error("OTP sending failed:", error);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    referralCode: user.referralCode,
    otpSent: true,
    message: "OTP sent successfully to your email",
    type: 'register'
  };
}
  
  // Verify email with OTP
  async verifyEmail(payload: IOtpVerification) {
    const { userId, otpCode, type } = payload;

  const otpRecord = await prisma.oTP.findUnique({
    where: {
      userId_otpCode: {
        userId,
        otpCode
      }
    },
    });

    if (!otpRecord) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP or expired OTP");
  }

  if (otpRecord.expiry < new Date()) {
    await prisma.oTP.delete({
        where: { id: otpRecord.id },
    });
    throw new ApiError(httpStatus.REQUEST_TIMEOUT, "OTP expired");
  }

    const user = await prisma.$transaction(async (tx) => {
      const userData = await tx.user.findUnique({
      where: { id: userId },
    });

      if (!userData) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

      if (!userData.isEmailVerified) {
        await tx.user.update({
          where: { id: userId },
          data: { isEmailVerified: true },
        });
      }

      // Delete OTP record
      await tx.oTP.deleteMany({ where: { userId } });

      const accessToken = jwtHelpers.generateToken(
        {
          id: userData.id,
          email: userData.email,
          role: userData.role,
        },
        config.jwt.access_secret as Secret,
        config.jwt.access_expires_in as string
      );

      // Send welcome email if this is a new registration
      if (type === 'register' && !userData.isEmailVerified) {
        setImmediate(async () => {
          try {
            const subject = `🎉 Welcome to Neo Market! Your account is now active`;
            const htmlContent = welcomeEmailTemplate(
              userData.name || 'User',
              userData.referralCode
            );
            
            await sentEmailUtility(
              userData.email,
              subject,
              htmlContent
            );
          } catch (error) {
            console.error('Failed to send welcome email:', error);
          }
        });
      }

      return {
        statusCode: httpStatus.OK,
        message: "OTP verified successfully",
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        image: userData.image,
        referralCode: userData.referralCode,
        credits: userData.credits,
        isEmailVerified: true,
        accessToken,
      };
    });

    return user;
  }

  // Login user
  async loginUser(payload: IUserLogin) {
    const { email, password } = payload;

    const userData = await prisma.user.findUnique({
      where: { email },
    });

    if (!userData) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const isCorrectPassword = await bcrypt.compare(password, userData.password as string);

    if (!isCorrectPassword) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect");
    }

    if (!userData.isEmailVerified) {
      OTPFn(userData.email, userData.id, "email Verification", emailTemplate);

      return {
        statusCode: httpStatus.PERMANENT_REDIRECT,
        message: "Please verify your email",
        userId: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        image: userData.image,
        isEmailVerified: userData.isEmailVerified,
        type: "register",
        accessToken: null,
      };
    }

    const accessToken = jwtHelpers.generateToken(
      {
        id: userData.id,
        email: userData.email,
        role: userData.role,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string
    );

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      image: userData.image,
      referralCode: userData.referralCode,
      credits: userData.credits,
      isEmailVerified: userData.isEmailVerified,
      accessToken,
    };
  }

  // Resend OTP
  async resendOtp(payload: { email?: string; userId?: string }) {
  const whereClause = payload.email 
    ? { email: payload.email }
    : { id: payload.userId };

  const existingUser = await prisma.user.findUnique({
    where: whereClause,
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

    OTPFn(existingUser.email, existingUser.id, "email Verification code", emailTemplate);

  return {
    id: existingUser.id,
    email: existingUser.email,
    otpSent: true,
    name: existingUser.name,
    message: "OTP sent successfully to your email",
  };
  }

  // Forgot password
  async forgotPassword(payload: { email: string }) {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
    }

    OTPFn(user.email, user.id, "Forgot Password OTP email", forgotEmailTemplate);

  return {
    id: user.id,
    name: user.name,
    otpSent: true,
    message: "OTP sent successfully to your email",
    type: 'forgotPassword'
  };
  }

  // Reset password
  async resetPassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Password reset successfully. Please login." };
  }

  // Change password
  async changePassword(userId: string, payload: IChangePassword) {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
      select: { password: true, email: true, id: true },
  });

  if (!userData) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
        'User not found!'
      );
    }

  const isCorrectPassword = await bcrypt.compare(
    payload.oldPassword,
    userData.password as string
  );

  if (!isCorrectPassword) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(payload.newPassword, Number(config.bcrypt_salt_rounds));

    await prisma.user.update({
    where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  // Admin login
  async adminLogin(payload: IUserLogin) {
    const { email, password } = payload;

    const userData = await prisma.user.findUnique({
      where: {
        email,
        role: Role.ADMIN
      },
    });

    if (!userData) {
      throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");
    }

    const isCorrectPassword = await bcrypt.compare(password, userData.password as string);

    if (!isCorrectPassword) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect");
    }

    const accessToken = jwtHelpers.generateToken(
      {
        id: userData.id,
        email: userData.email,
        role: userData.role,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string
    );

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      image: userData.image,
      isEmailVerified: userData.isEmailVerified,
      accessToken,
    };
  }
}

export const authService = new AuthService();