import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { userService } from "./Users.services";
import pickValidFields from "../../shared/pickValidFields";

export const UsersController = {
  getMyProfile: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const result = await userService.getMyProfile(userId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User profile retrieved successfully",
      data: result,
    });
  }),

  updateMyProfile: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const validData = pickValidFields(req.body, [
      "name",
      "fatherName",
      "email",
      "phone",
    ]);

    const result = await userService.updateMyProfile(userId as string, validData);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile updated successfully",
      data: result,
    });
  }),

  updateMyProfileImage: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { image } = req.body;

    const result = await userService.updateProfileImage(userId as string, image);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile photo updated successfully",
      data: result,
    });
  }),

  getAllUsers: catchAsync(async (req: Request, res: Response) => {
    const result = await userService.getAllUsers();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All users retrieved successfully",
      data: result,
    });
  }),

  deleteUser: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await userService.deleteUser(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: result.message,
      data: null,
    });
  }),
};
