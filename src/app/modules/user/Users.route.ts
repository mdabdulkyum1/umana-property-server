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

router.patch("/make-leader/:id", auth(Role.ADMIN), UsersController.makeLeader);
router.patch("/update-user-by-admin/:id", auth(Role.ADMIN), UsersController.updateUserByAdmin);
router.delete("/delete/:id", auth(Role.ADMIN), UsersController.deleteUser);

export const UserRouters = router;
