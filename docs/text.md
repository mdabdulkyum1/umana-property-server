### umana property

## auth

```
 [done]: register user 
    |-- /auth/create-account
    body:
    {
       "name": "Md Abdul Kyum",
       "email": "kyummdabdul@gmail.com",
       "phone": "01754462008",
       "password": "123456As",
       "fatherName": "Shah Alom"
    }

[done]: login user 
    |-- /auth/login
    body: 
    {
        "phone":"01754462008",
        "password":"123456As"
    }

```






Umana Property Investment Project – Summary (Bangla)
1️⃣ Project Overview

এই project একটি community-driven investment platform, যেখানে users (members) collective fund invest করে এবং profit share পায়।

প্রতিটি user নিজের phone + password দিয়ে register/login করবে।

User-রা multiple investment cycles এ একসাথে participate করতে পারবে।

Leader/Administrator manually payment update করতে পারবে।

2️⃣ Main Entities / Database Schema

User

Fields: id, name, fatherName, phone, password, email, image, role, createdAt, updatedAt

Relation: payments[]

Users can update their profile image.

Payment

Fields: id, userId, cycleId, amount, fine, paymentDate, isPaid, paymentMethod, updatedBy

Each payment belongs to a user and optionally a cycle.

InvestmentCycle

Fields: id, name, totalDeposit, totalProfit, isInvested, distributed, startDate, endDate, payments[]

Tracks collective investment, profit, and distribution status.

Multiple users can participate in the same cycle; multiple cycles can run simultaneously.

3️⃣ Core Features

User Management

Register, Login (phone + password)

Change Password

Reset Password

Update Profile Image

Payments & Investment

Users make payments (manually updated by leader/admin)

Payments track amount, fine, date, and payment method

Investment cycles can start anytime funds are available

Profit is calculated after investment cycle closes

Multiple investment cycles can run at the same time

Dashboard shows: Date, User ID, Name, Father’s Name, Mobile, Deposit, Total Deposit, Fine, Profit, etc.

Profit & Tracking

Total profit of a cycle is distributed proportionally to users

Each user’s multiple investments tracked separately

System supports dynamic tracking of payments, fines, and profit

4️⃣ Key Points

Leader/admin manually updates payments, marks cycles as invested/distributed.

Every user can see common dashboard with all users’ data.

Flexible system: supports multiple simultaneous investments, dynamic profit distribution, and fine system.

Next Steps

User registration/login is done.

Payment, investment cycle, dashboard, and profit distribution will be implemented next.

💡 Tip:
যখন নতুন চ্যাট শুরু করবে, তুমি শুধু লিখবে:
"Umana Property project summary: [paste this summary]"