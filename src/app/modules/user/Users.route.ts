import express from 'express';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import { UsersController } from './Users.controller';

const router = express.Router();

// User profile routes
router.get('/me', auth(), UsersController.getMyProfile);
router.put('/update-profile', auth(), UsersController.updateMyProfile);
router.patch('/me/uploads-profile-photo', auth(), UsersController.updateMyProfileImage);

// Admin routes
router.get('/all', auth(Role.ADMIN), UsersController.getAllUsers);
// router.put('/status/:userId', auth(Role.ADMIN), UsersController.updateUserStatus);

// Dashboard and referral routes
router.get('/dashboard', auth(), UsersController.getUserDashboard);
router.get('/referrals/history', auth(), UsersController.getReferralHistory);

// Public routes
router.get('/:id',auth(Role.USER), UsersController.getUserProfileById);
router.delete("/delete/:id", auth(Role.ADMIN, Role.USER), UsersController.deleteUser);

export const UserRouters = router;
