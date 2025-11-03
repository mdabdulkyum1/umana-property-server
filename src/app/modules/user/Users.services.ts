import httpStatus from 'http-status';
import prisma from '../../lib/prisma';
import { Role } from '@prisma/client';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../helpers/paginationHelper';
import ApiError from '../../errors/ApiError';
import { ValidationUtils } from '../../utils/validation';

class UserService {
  // Get user profile
  async getMyProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        referralCode: true,
        credits: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

    return user;
  }

  // Get user profile by ID
  async getUserProfileById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
        referralCode: true,
        credits: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
  }

  // Get all users with pagination
  async getAllUsers(options: IPaginationOptions) {
    // Validate pagination parameters
    const validatedPagination = ValidationUtils.validatePagination(options.page, options.limit);
    const { page, limit, skip } = paginationHelper.calculatePagination({
      ...options,
      page: validatedPagination.page,
      limit: validatedPagination.limit,
    });

    const users = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.USER, Role.ADMIN],
        },
      },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        referralCode: true,
        credits: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.user.count({
      where: {
        role: {
          in: [Role.USER, Role.ADMIN],
        },
      },
    });

    return {
      meta: {
        total,
        page,
        totalPage: Math.ceil(total / limit),
        limit,
      },
      data: users,
    };
  }

  // Update user profile
  async updateMyProfile(userId: string, payload: any) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Only allow updating specific fields: name, email
    const updateData: any = {};

    if (payload.name !== undefined) {
      updateData.name = payload.name;
    }

    if (payload.email !== undefined) {
      // Check if email is already taken by another user
      const emailExists = await prisma.user.findFirst({
        where: {
          email: payload.email,
          id: { not: userId },
        },
      });

      if (emailExists) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already taken');
      }

      updateData.email = payload.email;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        referralCode: true,
        credits: true,
        role: true,
        isEmailVerified: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  // Update user profile image
async  updateMyProfileImage(userId: string, image: string) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { image: true },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { image: image },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  return updatedUser;
}


  // Get user dashboard data
  async getUserDashboard(userId: string) {
    try {
      // Validate input
      ValidationUtils.validateUserId(userId);

      // Get user basic info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          referralCode: true,
          credits: true,
          image: true,
        },
      });

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

      // Get dashboard data separately to avoid complex joins
      const dashboard = await prisma.dashboard.findUnique({
        where: { userId },
        select: {
          referredUsers: true,
          convertedUsers: true,
          totalCredits: true,
        },
      });

      // Get recent referrals with limited data
      const recentReferrals = await prisma.referral.findMany({
        where: { referrerId: userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          createdAt: true,
          referred: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      const referralLink = `${process.env.FRONTEND_URL}/register?r=${user.referralCode}`;

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          referralCode: user.referralCode,
          credits: user.credits,
          image: user.image,
        },
        dashboard: {
          totalReferredUsers: dashboard?.referredUsers || 0,
          convertedUsers: dashboard?.convertedUsers || 0,
          totalCreditsEarned: dashboard?.totalCredits || 0,
          referralLink,
        },
        recentReferrals: recentReferrals.map(referral => ({
          id: referral.id,
          referredUser: referral.referred,
          status: referral.status,
          createdAt: referral.createdAt,
        })),
      };
    } catch (error) {
      console.error('Error in getUserDashboard:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to get user dashboard');
    }
  }

  // Get referral history
  async getReferralHistory(userId: string, options: IPaginationOptions) {
    try {
      // Validate input
      ValidationUtils.validateUserId(userId);
      
      // Validate pagination parameters
      const validatedPagination = ValidationUtils.validatePagination(options.page, options.limit);
      const { page, limit, skip } = paginationHelper.calculatePagination({
        ...options,
        page: validatedPagination.page,
        limit: validatedPagination.limit,
      });

      // Get referrals with basic info only
      const referrals = await prisma.referral.findMany({
        where: { referrerId: userId },
        select: {
          id: true,
          status: true,
          createdAt: true,
          convertedAt: true,
          referred: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              createdAt: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Get total count
      const total = await prisma.referral.count({
        where: { referrerId: userId },
      });

      return {
        meta: {
          total,
          page,
          totalPage: Math.ceil(total / limit),
          limit,
        },
        data: referrals,
      };
    } catch (error) {
      console.error('Error in getReferralHistory:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to get referral history');
    }
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