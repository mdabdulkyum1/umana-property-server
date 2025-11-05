import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import httpStatus from "http-status";
import { investmentCycleService } from "./investmentcycle.service";
import { paymentService } from "../payment/payment.service";

const createCycle = catchAsync(async (req: Request, res: Response) => {
  const result = await investmentCycleService.createCycle(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Investment cycle created successfully",
    data: result,
  });
});

const getAllCycles = catchAsync(async (req: Request, res: Response) => {
  const result = await investmentCycleService.getAllCycles();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "All investment cycles fetched successfully",
    data: result,
  });
});

const getCycleById = catchAsync(async (req: Request, res: Response) => {
  const result = await investmentCycleService.getCycleById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Investment cycle fetched successfully",
    data: result,
  });
});

const updateCycle = catchAsync(async (req: Request, res: Response) => {
  const result = await investmentCycleService.updateCycle(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Investment cycle updated successfully",
    data: result,
  });
});

const deleteCycle = catchAsync(async (req: Request, res: Response) => {
  const result = await investmentCycleService.deleteCycle(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Investment cycle deleted successfully",
    data: result,
  });
});

const markAsInvested = catchAsync(async (req: Request, res: Response) => {
  const result = await investmentCycleService.markAsInvested(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Investment cycle marked as invested",
    data: result,
  });
});

const distributeProfit = catchAsync(async (req: Request, res: Response) => {
  
  const result = await investmentCycleService.distributeProfit(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Profit distributed successfully",
    data: result,
  });
});

export const investmentCycleController = {
  createCycle,
  getAllCycles,
  getCycleById,
  updateCycle,
  deleteCycle,
  markAsInvested,
  distributeProfit,
};

// Extra admin utility: assign paid payments to a cycle
export const assignPaidPaymentsToCycle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { paymentIds } = req.body as { paymentIds?: string[] };
  const result = await paymentService.assignPaidPaymentsToCycle(id, paymentIds);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Paid payments assigned to cycle",
    data: result,
  });
});
