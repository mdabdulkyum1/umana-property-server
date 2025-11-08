import { Role } from "@prisma/client";



export interface IUserLogin {  
    email: string;
    password: string;
}

export interface IChangePassword{
  newPassword: string;
  oldPassword: string;
}
