# 💰 Investment Management System

A secure and dynamic backend system for managing user investments, profit cycles, and payments — built with **Node.js**, **TypeScript**, **Express**, **Prisma ORM**, and **MongoDB**.

---

## 🧠 Project Overview

This project provides a structured investment management system where:

- Users can register and log in using **phone number and password**.  
- Admins can manage multiple **investment cycles** (each with its own start/end date, total deposits, and profit distribution).  
- Users can make **manual payments** (via bKash, Nagad, etc.), which are recorded and linked to specific cycles.  
- Leaders/admins can **update user payment status**, apply fines, and handle profit distribution after all investments are combined.  
- The system maintains **transparent tracking** of all user deposits, fines, and profit cycles.

---

## ⚙️ Tech Stack

| Layer | Technology |
|--------|-------------|
| Language | **TypeScript** |
| Framework | **Express.js** |
| ORM | **Prisma (MongoDB provider)** |
| Database | **MongoDB** |
| Validation | **Zod** |
| Authentication | **JWT (JSON Web Token)** |
| Security | **bcrypt** for password hashing |
| Utilities | **http-status**, **custom ApiError**, and **response helpers** |

---

## 🏗️ Folder Structure

---

🔐 Authentication Flow
User registers with phone, fatherName, and password.

Password is hashed using bcrypt.

JWT is generated for secure session handling.

Admin can later update user image or verify manual payments.

💵 Investment Flow
User sends money manually (e.g., via bKash/Nagad) to leader/admin.

Admin updates the user’s Payment record → marks isPaid = true.

Once all users have paid → Admin creates or updates an Investment Cycle.

Profit is recorded and distributed later via the cycle.

📘 API Modules
Module	Description
Auth	Handles user registration, login, password change
InvestmentCycle	Manage cycles (create, view, update)
Payment	Handle deposits, fines, and user payments
User	Manage user data, update profile image, and roles
TCH	/api/user/profile	Update user info









