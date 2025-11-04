import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { paymentService } from "./payment.service";

// Create new payment
const createPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.createPayment(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Payment created successfully",
    data: result,
  });
});

// Get all payments
const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getAllPayments();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "All payments fetched successfully",
    data: result,
  });
});

// Get user payments
const getUserPayments = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await paymentService.getUserPayments(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User payments fetched successfully",
    data: result,
  });
});

// Update payment
const updatePayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await paymentService.updatePayment(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Payment updated successfully",
    data: result,
  });
});

// Delete payment
const deletePayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await paymentService.deletePayment(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Payment deleted successfully",
    data: result,
  });
});

export const PaymentController = {
  createPayment,
  getAllPayments,
  getUserPayments,
  updatePayment,
  deletePayment,
};
