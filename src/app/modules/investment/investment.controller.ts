import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { investmentService } from "./investment.service";

// Create new investment cycle
const createCycle = catchAsync(async (req: Request, res: Response) => {
  const result = await investmentService.createCycle(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Investment cycle created successfully",
    data: result,
  });
});

// Get all cycles
const getAllCycles = catchAsync(async (req: Request, res: Response) => {
  const result = await investmentService.getAllCycles();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "All investment cycles fetched successfully",
    data: result,
  });
});

// Get single cycle
const getCycleById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await investmentService.getCycleById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Investment cycle details fetched successfully",
    data: result,
  });
});

// Distribute profit
const distributeProfit = catchAsync(async (req: Request, res: Response) => {
  const { cycleId, totalProfit } = req.body;
  const result = await investmentService.distributeProfit(cycleId, totalProfit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Profit distributed successfully",
    data: result,
  });
});

// Delete cycle
const deleteCycle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await investmentService.deleteCycle(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Cycle deleted successfully",
    data: result,
  });
});

export const InvestmentController = {
  createCycle,
  getAllCycles,
  getCycleById,
  distributeProfit,
  deleteCycle,
};
