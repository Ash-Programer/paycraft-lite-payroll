# PayCraft Lite - India-Compliant HR Payroll System

PayCraft Lite is a compact payroll management tool built for the Mid/Senior Full-Stack evaluation. It allows HR users to manage employees, define salary structures, and generate India-compliant salary slips with automated email delivery.

## 🛠 Tech Stack

- **Frontend:** React.js (Vite), Tailwind CSS, Lucide Icons.
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL (Raw SQL).
- **Security:** JWT Authentication, Bcrypt password hashing.

## ⚙️ Setup & Installation

### Method 1: Using Docker (Recommended)

1. Ensure Docker Desktop is running.
2. From the root directory, run:
   ```bash
   docker-compose up --build
   ```
3. Access the application at: http://localhost:5173

### Method 2: Manual Local Setup

1. Database: Create a PostgreSQL database named paycraft and run database/schema.sql.
2. Backend: Navigate to /backend, run npm install, configure .env, and npm start.
3. Frontend: Navigate to /frontend, run npm install, and npm run dev.

## 🔐 Sample Credentials (For Testing)

The database is automatically seeded with the following accounts:

- **HR Administrator:** `admin@paycraft.com` / `password123`
- **Employee:** `jane@example.com` / `password123`

## 🚀 Features implemented

- **RBAC (Role-Based Access Control):** Server-side enforcement for HR and Employee roles.
- **Payroll Engine:**
  - New Tax Regime (FY 2024-25) slab-based calculation.
  - Section 87A Rebate & Standard Deduction (₹75,000) logic.
  - Provident Fund (PF) with statutory wage ceiling (₹15,000).
  - Professional Tax (Flat ₹200/month - Maharashtra slab).
  - Loss-of-Pay (LOP) proration for monthly components.
- **Automated Workflows:**
  - PDF Generation with Indian numbering system (Lakhs).
  - Email delivery via Mailtrap (SMTP/API).
  - Versioned payslip history.

## 💡 Architectural Decisions

- **Raw SQL (Node-Postgres):** I chose to use raw SQL over an ORM to demonstrate proficiency in relational data modeling, transaction management (used in Employee Onboarding), and to avoid the overhead of an abstraction layer for financial data.
- **Audit-Ready Payslips:** Payslips store earnings and deductions as `JSONB`. This ensures that even if an employee's salary structure is updated later, historical payslips remain accurate and unchanged.
- **Security:** RBAC is enforced via custom middleware at the controller level, ensuring an employee can never "ID-guess" another user's payslip.

## 📝 Assumptions Made

- **Professional Tax:** Assumed a flat ₹200/month as per the Maharashtra state slab.
- **Proration:** Loss of Pay (LOP) is calculated based on the total number of calendar days in the month (e.g., 28 for Feb, 31 for Oct).
- **Tax Rebate:** Implemented the 87A rebate for the New Regime, where income up to ₹7,00,000 (taxable) results in zero tax liability.

## 🧪 Testing & Documentation

- **Unit Tests:** Core tax and PF calculation logic is tested using Jest.
  Run: `cd backend && node src/utils/payrollEngine.test.js`
- **API Documentation:** A Postman Collection is provided in the `/docs` folder for easy endpoint testing.
