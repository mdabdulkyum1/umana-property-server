import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import httpStatus from "http-status";
import { adminDashboardService } from "./dashboard.service";

export const getSummary = catchAsync(async (_req: Request, res: Response) => {
  const result = await adminDashboardService.getSummary();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Dashboard summary fetched",
    data: result,
  });
});

export const getUsersOverview = catchAsync(async (_req: Request, res: Response) => {
  const result = await adminDashboardService.getUsersOverview();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Users overview fetched",
    data: result,
  });
});


