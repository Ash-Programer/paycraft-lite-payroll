-- Clean up
TRUNCATE users, employees, salary_structures, payslips RESTART IDENTITY CASCADE;

-- 1. Create HR Admin (Pass: password123)
INSERT INTO users (email, password, role) 
VALUES ('admin@paycraft.com', '$2a$12$zwX7omyXr347YUzEXPMDuO1fuAd4nJGw1wDjyZfPDz5XawWSxVsrm', 'HR');

-- 2. Create Sample Employee User (Pass: password123)
INSERT INTO users (email, password, role) 
VALUES ('jane@example.com', '$2a$12$zwX7omyXr347YUzEXPMDuO1fuAd4nJGw1wDjyZfPDz5XawWSxVsrm', 'EMPLOYEE');

-- 3. Create Employee Profile
INSERT INTO employees (user_id, name, email, pan, bank_account, department, designation, date_of_joining, monthly_ctc) 
VALUES (2, 'Jane Smith', 'jane@example.com', 'ABCDE1234Z', '1122334455', 'Marketing', 'Lead Designer', '2023-05-15', 150000);

-- 4. Create Salary Structure
INSERT INTO salary_structures (employee_id, basic, hra, special_allowance, employer_pf) 
VALUES (1, 75000, 30000, 45000, 1800);