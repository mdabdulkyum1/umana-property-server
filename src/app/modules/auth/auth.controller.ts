import httpStatus from "http-status";
import sendResponse from "../../helpers/sendResponse";
import { authService } from "./auth.service";
import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";


const createAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new Error("User not authenticated");

  const { oldPassword, newPassword } = req.body;

  const result = await authService.changePassword(userId, oldPassword, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Password changed successfully",
    data: result,
  });
});

export const AuthControllers = {
  createAccount,
  loginUser,
  changePassword,
};
