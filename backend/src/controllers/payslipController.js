const { pool } = require("../config/db.js");
const payrollService = require("../services/payrollService.js");
const pdfEmailService = require("../services/pdfEmailService.js"); // New Import
const path = require("path");
const fs = require("fs");

exports.generate = async (req, res) => {
  const { employeeId, month, year, lopDays } = req.body;

  try {
    // 1. Get employee info and salary structure
    const resEmp = await pool.query(
      `SELECT e.*, s.basic, s.hra, s.special_allowance, s.employer_pf 
       FROM employees e 
       JOIN salary_structures s ON e.id = s.employee_id 
       WHERE e.id = $1`,
      [employeeId],
    );

    if (resEmp.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Employee or Salary Structure not found" });
    }
    const employee = resEmp.rows[0];

    // 2. Calculate Payroll Logic (Earnings, Deductions, Net Pay)
    const daysInMonth = new Date(year, month, 0).getDate();
    const results = payrollService.calculateMonthlyPayroll(
      employee,
      lopDays,
      daysInMonth,
    );

    // 3. Versioning check: Increment version if slip for this month already exists
    const versionRes = await pool.query(
      "SELECT MAX(version) FROM payslips WHERE employee_id = $1 AND month = $2 AND year = $3",
      [employeeId, month, year],
    );
    const nextVersion = (versionRes.rows[0].max || 0) + 1;

    // 4. Save to Database (Initially with PENDING status)
    const slip = await pool.query(
      `INSERT INTO payslips (employee_id, month, year, version, lop_days, earnings, deductions, net_pay, email_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        employeeId,
        month,
        year,
        nextVersion,
        lopDays,
        results.earnings,
        results.deductions,
        results.netPay,
        "PENDING",
      ],
    );

    const generatedSlip = slip.rows[0];

    // 5. Trigger PDF Generation and Email Delivery (Asynchronous)
    // We do this in a try-catch so if email fails, the record still exists in DB
    try {
      await pdfEmailService.generateAndEmailPath(employee, {
        ...results,
        month,
        year,
      });

      // 6. Update status to SENT if successful
      await pool.query("UPDATE payslips SET email_status = $1 WHERE id = $2", [
        "SENT",
        generatedSlip.id,
      ]);

      console.log(
        `✅ Payslip v${nextVersion} emailed successfully to ${employee.email}`,
      );
    } catch (emailErr) {
      console.error("❌ Email Delivery Failed:", emailErr.message);

      // Update status to FAILED
      await pool.query("UPDATE payslips SET email_status = $1 WHERE id = $2", [
        "FAILED",
        generatedSlip.id,
      ]);
    }

    // 7. Send final response to HR
    res.status(201).json({
      message: "Payslip generated and processing completed",
      data: {
        ...generatedSlip,
        email_status: "SENT/FAILED check history", // UI will refresh from history
      },
    });
  } catch (err) {
    console.error("🔥 Generation Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
exports.getHistory = async (req, res) => {
  const { employeeId, month, year } = req.query; // Get filters from URL params

  let query = `
        SELECT p.*, e.name, e.email 
        FROM payslips p 
        JOIN employees e ON p.employee_id = e.id 
        WHERE 1=1
    `;
  let params = [];

  // RBAC: Employees only see their own
  if (req.user.role === "EMPLOYEE") {
    params.push(req.user.employeeId);
    query += ` AND p.employee_id = $${params.length}`;
  } else if (employeeId) {
    params.push(employeeId);
    query += ` AND p.employee_id = $${params.length}`;
  }

  if (month) {
    params.push(month);
    query += ` AND p.month = $${params.length}`;
  }

  if (year) {
    params.push(year);
    query += ` AND p.year = $${params.length}`;
  }

  query += " ORDER BY p.created_at DESC";

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.download = async (req, res) => {
  const { id } = req.params;

  try {
    const slipResult = await pool.query(
      `SELECT p.*, e.name, e.designation, e.pan, e.email, s.basic, s.hra, s.special_allowance 
       FROM payslips p 
       JOIN employees e ON p.employee_id = e.id 
       JOIN salary_structures s ON e.id = s.employee_id
       WHERE p.id = $1`,
      [id],
    );

    if (slipResult.rows.length === 0)
      return res.status(404).send("Slip not found");
    const data = slipResult.rows[0];

    // --- UPDATED SECURITY CHECK ---
    // Use employee_id from DB vs employeeId from JWT
    if (req.user.role === "EMPLOYEE") {
      // Ensure the ID in the token matches the ID of the owner of the slip
      if (parseInt(data.employee_id) !== parseInt(req.user.employeeId)) {
        console.log(
          `🚫 Security Block: User ${req.user.employeeId} tried to access slip of User ${data.employee_id}`,
        );
        return res.status(403).json({
          message: "Unauthorized: You can only access your own slips.",
        });
      }
    }

    // 2. Locate the file in temp
    const fileName = `payslip_${data.employee_id}_${data.month}_${data.year}.pdf`;
    const filePath = path.join(__dirname, "../../temp", fileName);

    // 3. Check if file exists, if not, generate it (Safety measure)
    if (fs.existsSync(filePath)) {
      return res.download(filePath); // Serve the existing file!
    } else {
      // Fallback: If file was deleted from temp, you should regenerate it here
      res.status(404).send("PDF file no longer exists on server.");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
