import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { sendReferralBonusEmail } from '../../utils/emailNotifications/referralNotificationService';
import { welcomeEmailTemplate } from '../../utils/emailNotifications/welcomeHTML';
import sentEmailUtility from '../../utils/sentEmailUtility';

// Test referral bonus email
const testReferralBonusEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, name, credits } = req.body;
  
  const result = await sendReferralBonusEmail({
    userEmail: email,
    userName: name || 'Test User',
    creditsEarned: credits || 2,
    referralCode: 'TEST123',
    referredUserName: 'Referred User',
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Test referral bonus email sent!',
    data: { emailSent: result },
  });
});

// Test welcome email
const testWelcomeEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, name } = req.body;
  
  try {
    const subject = `🎉 Welcome to Neo Market! - Test Email`;
    const htmlContent = welcomeEmailTemplate(
      name || 'Test User',
      'TEST123'
    );
    
    await sentEmailUtility(
      email,
      subject,
      htmlContent
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Test welcome email sent!',
      data: { emailSent: true },
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Failed to send test welcome email',
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
});

export const EmailController = {
  testReferralBonusEmail,
  testWelcomeEmail,
};
