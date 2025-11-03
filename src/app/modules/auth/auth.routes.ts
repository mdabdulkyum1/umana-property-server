import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { authValidation } from "./auth.validation";
import { AuthControllers } from "./auth.controller";
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/create-account', validateRequest(authValidation.registerUser),
  AuthControllers.createAccount
);

router.post(
  "/login",
  validateRequest(authValidation.loginUser),
  AuthControllers.loginUser
);

router.post(
  "/change-password",
  validateRequest(authValidation.changePassword),
  auth(),
  AuthControllers.changePassword
);

export const AuthRouters = router;
