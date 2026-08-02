const db = require("../config/db.js");
const bcrypt = require("bcryptjs");

exports.addEmployee = async (req, res) => {
  const {
    name,
    email,
    password,
    pan,
    bank_account,
    department,
    designation,
    doj,
    monthly_ctc,
    structure,
  } = req.body;

  try {
    // Start a Transaction (Atomic operation)
    await db.query("BEGIN");

    // 1. Create User
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRes = await db.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id",
      [email, hashedPassword, "EMPLOYEE"],
    );
    const userId = userRes.rows[0].id;

    // 2. Create Employee
    const empRes = await db.query(
      `INSERT INTO employees (user_id, name, email, pan, bank_account, department, designation, date_of_joining, monthly_ctc) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        userId,
        name,
        email,
        pan,
        bank_account,
        department,
        designation,
        doj,
        monthly_ctc,
      ],
    );
    const empId = empRes.rows[0].id;

    // 3. Create Salary Structure
    await db.query(
      `INSERT INTO salary_structures (employee_id, basic, hra, special_allowance, employer_pf) 
             VALUES ($1, $2, $3, $4, $5)`,
      [
        empId,
        structure.basic,
        structure.hra,
        structure.special_allowance,
        structure.employer_pf,
      ],
    );

    await db.query("COMMIT");
    res.status(201).json({ message: "Employee created successfully" });
  } catch (err) {
    await db.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  }
};

exports.getAllEmployees = async (req, res) => {
  const result = await db.query("SELECT * FROM employees ORDER BY id DESC");
  res.json(result.rows);
};
