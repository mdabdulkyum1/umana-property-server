import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { paymentService } from "./payment.service";


const createPayment = catchAsync(async (req: Request, res: Response) => {

  const userId = req.body.userId;
  const amount = req.body.amount;
  const date   = req.body.date;
  if (!userId) throw new Error("User not authenticated");


  const result = await paymentService.createPayment(userId, amount, date);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Payment created successfully",
    data: result,
  });
});


const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getAllPayments();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "All payments fetched successfully",
    data: result,
  });
});

const myPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await paymentService.myPayments(userId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User payments fetched successfully",
    data: result,
  });
})

const getUserPayments = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await paymentService.getUserPayments(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User payments fetched successfully",
    data: result,
  });
});

const updatePayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await paymentService.updatePayment(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Payment updated successfully",
    data: result,
  });
});

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
  myPayments,
  getUserPayments,
  updatePayment,
  deletePayment,
};
