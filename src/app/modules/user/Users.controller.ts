import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { userService } from './Users.services';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import pickValidFields from '../../shared/pickValidFields';

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  const data = await userService.getMyProfile(userId); // Fetch work area by ID
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fetched profile successfully!',
    data: data,
  });
});

const getUserProfileById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id; // Get user ID from the request object

  const data = await userService.getUserProfileById(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fetched profile successfully!',
    data: data,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const options = pickValidFields(req.query, ['limit', 'page', 'status']);

  const data = await userService.getAllUsers(options); // Fetch work area by ID
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fetched users successfully!',
    data: data,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  const payload = req.body;
  const data = await userService.updateMyProfile(userId, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully!',
    data: data,
  });
});

const updateMyProfileImage = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { image } = req.body;

  if (!image) {
    throw new Error("Image URL is required");
  }

  const updatedUser = await userService.updateMyProfileImage(userId, image);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile image updated successfully!",
    data: updatedUser,
  });
});

// const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.params.userId; // Get userId from route params, not from token
//   const result = await userService.updateUserStatus(userId, req.body);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: 'User status updated successfully',
//     data: result,
//   });
// });

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id; // Get userId from route params
  const result = await userService.deleteUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User deleted successfully',
    data: result,
  });
});

// Dashboard controller
const getUserDashboard = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  const data = await userService.getUserDashboard(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard data fetched successfully!',
    data: data,
  });
});

// Referral history controller
const getReferralHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  const options = pickValidFields(req.query, ['limit', 'page']);
  const data = await userService.getReferralHistory(userId, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Referral history fetched successfully!',
    data: data,
  });
});

export const UsersController = {
  getMyProfile,
  getUserProfileById,
  getAllUsers,
  // updateUserStatus,
  updateMyProfile,
  updateMyProfileImage,
  deleteUser,
  getUserDashboard,
  getReferralHistory,
};
