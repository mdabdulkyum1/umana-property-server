import { z } from 'zod';

const registerUser = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const loginUser = z.object({
  body: z.object({
    phone: z
      .string()
      .min(1, 'Phone is required')
      .regex(/^01[3-9]\d{8}$/, 'Invalid phone number format'),
    password: z.string().min(1, 'Password is required'),
  }),
});



const forgotPassword = z.object({
  body: z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
  }),
});

const resetPassword = z.object({
  body: z.object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const changePassword = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const authValidation = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
};
