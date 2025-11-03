import httpStatus from "http-status";
import sendResponse from "../../helpers/sendResponse";
import { authService } from "./auth.service";
import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";

const createAccount = catchAsync(async (req, res) => {

  const result = await authService.registerUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'verify your otp code',
    data: result,
  });
});

const verifiedEmail = catchAsync(async (req, res) => {
  const { userId, otpCode, type } = req.body

  const result: any = await authService.verifyEmail({ userId, otpCode, type });
  if (result.statusCode) {
    const { statusCode, message, ...data } = result
    return sendResponse(res, {
      statusCode,
      message,
      data: data,
    });
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP verified successfully',
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);

  if (result.statusCode) {
    const { statusCode, message, ...data } = result
    return sendResponse(res, {
      statusCode,
      message,
      data: data,
    });

  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: result,
  });
});

const adminLoginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.adminLogin(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: result,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "An secret number has been send",
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id
  if (!userId) {
    throw new Error('User not authenticated');
  }
  const newPassword = req.body.newPassword;
  const result = await authService.resetPassword(userId, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Password Reset successfully please login",
    data: result,
  });
});
const changePassword = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  const oldPassword: string = req.body.oldPassword;
  const newPassword: string = req.body.newPassword;
  const result = await authService.changePassword(userId, {
    newPassword,
    oldPassword,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'password changed successfully',
    data: result,
  });
});
const resendOtp = catchAsync(async (req, res) => {
  
  const payload = {
    email: req.body.email,
    userId: req.body.userId
  };

  const result: any = await authService.resendOtp(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP sent successfully',
    data: result,
  });
});


export const AuthControllers = {
  createAccount,
  loginUser,
  forgotPassword, 
  resetPassword, 
  changePassword,
  verifiedEmail,
  adminLoginUser, 
  resendOtp,
};
