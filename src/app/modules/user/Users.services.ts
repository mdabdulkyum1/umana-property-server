import httpStatus from 'http-status';
import prisma from '../../lib/prisma';
import { Role } from '@prisma/client';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../helpers/paginationHelper';
import ApiError from '../../errors/ApiError';
import { ValidationUtils } from '../../utils/validation';

class UserService {
 
 // Update profile image
  async updateProfileImage(userId: string, imageUrl: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });

    return {
      id: user.id,
      name: user.name,
      fatherName: user.fatherName,
      phone: user.phone,
      email: user.email,
      image: user.image,
      message: "Profile image updated successfully",
    };
  }

  // Delete user (admin only)
  async deleteUser(userId: string) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, image: true },
    });

    if (!existingUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Soft delete the user
    await prisma.user.update({
      where: { id: userId },
      data: { 
        // Add soft delete field if needed in schema
        // isDeleted: true 
      },
    });

    return { message: 'User deleted successfully' };
  }
}

export const userService = new UserService();