import { Role } from "@prisma/client";

// Core authentication interfaces for Neo Market referral system
export interface IRegisterUser {  
    name: string;
    email: string;
    password: string;
    referralCode?: string; // Optional referral code from referrer
}

export interface IOtp {  
    userId: string; 
    otpCode: string 
}

export interface IUserLogin {  
    email: string;
    password: string;
}

export interface IChangePassword{
  newPassword: string;
  oldPassword: string;
}
