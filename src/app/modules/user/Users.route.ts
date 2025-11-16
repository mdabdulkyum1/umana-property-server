import express from 'express';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import { UsersController } from './Users.controller';

const router = express.Router();


router.get('/me', auth(), UsersController.getMyProfile);
router.put('/update-profile', auth(), UsersController.updateMyProfile);
router.patch('/me/uploads-profile-photo', auth(), UsersController.updateMyProfileImage);


router.get('/all', auth(Role.ADMIN, Role.USER), UsersController.getAllUsers);
router.get('/get-user-payment/:id', auth(Role.ADMIN), UsersController.getUserById);
router.delete("/delete/:id", auth(Role.ADMIN, Role.USER), UsersController.deleteUser);

export const UserRouters = router;
