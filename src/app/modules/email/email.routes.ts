import express from 'express';
import { EmailController } from './email.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// Test email endpoints (for development/testing only)
router.post(
  '/test/referral-bonus',
  auth(),
  EmailController.testReferralBonusEmail
);

router.post(
  '/test/welcome',
  auth(),
  EmailController.testWelcomeEmail
);

export const EmailRouters = router;
