import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { userService } from './Users.services';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import pickValidFields from '../../shared/pickValidFields';


const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id; // Get userId from route params
  const result = await userService.deleteUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User deleted successfully',
    data: result,
  });
});



export const UsersController = {


};
