const { pool } = require("../config/db.js"); // Using pool as per your db.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  // Use .trim() to remove any accidental spaces
  const email = req.body.email ? req.body.email.trim().toLowerCase() : "";
  const password = req.body.password ? req.body.password.trim() : "";

  console.log("-----------------------------------------");
  console.log("Login attempt for:", email);

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (userResult.rows.length === 0) {
      console.log("❌ No user found in DB for:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];
    console.log(
      "✅ User found in DB. Stored hash starts with:",
      user.password.substring(0, 10),
    );

    // Compare
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Comparing password:", password);
    console.log("🔍 Match Result:", isMatch);

    if (!isMatch) {
      console.log("❌ PASSWORD MISMATCH");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Success... (rest of the code for token generation)
    const empResult = await pool.query(
      "SELECT id FROM employees WHERE user_id = $1",
      [user.id],
    );
    const employeeId = empResult.rows[0]?.id || null;

    const token = jwt.sign(
      { id: user.id, role: user.role, employeeId: employeeId },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1d" },
    );

    console.log("🎉 SUCCESS: Token generated!");
    res.json({ token, role: user.role });
  } catch (err) {
    console.error("🔥 Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
