-- 1. Users Table (Auth)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('HR', 'EMPLOYEE')) DEFAULT 'EMPLOYEE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Employees Table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    pan VARCHAR(10) UNIQUE NOT NULL,
    bank_account VARCHAR(20) NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    date_of_joining DATE NOT NULL,
    monthly_ctc DECIMAL(12, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Salary Structure Table
CREATE TABLE salary_structures (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) UNIQUE,
    basic DECIMAL(12, 2) NOT NULL,
    hra DECIMAL(12, 2) NOT NULL,
    special_allowance DECIMAL(12, 2) NOT NULL,
    employer_pf DECIMAL(12, 2) NOT NULL
);

-- 4. Payslips Table (Versioned)
CREATE TABLE payslips (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    version INTEGER DEFAULT 1,
    lop_days INTEGER DEFAULT 0,
    earnings JSONB NOT NULL,    -- {basic, hra, special_allowance}
    deductions JSONB NOT NULL,  -- {tds, pf, professional_tax}
    net_pay DECIMAL(12, 2) NOT NULL,
    email_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for Performance
-- Speeds up searching for payslips by month/year and employee
CREATE INDEX idx_payslips_employee_date ON payslips(employee_id, month, year);

-- Speeds up finding an employee by their user_id during login
CREATE INDEX idx_employees_user_id ON employees(user_id);