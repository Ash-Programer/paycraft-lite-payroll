# PayCraft Lite - India-Compliant HR Payroll System

PayCraft Lite is a compact payroll management tool built for the Mid/Senior Full-Stack evaluation. It allows HR users to manage employees, define salary structures, and generate India-compliant salary slips with automated email delivery.

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
