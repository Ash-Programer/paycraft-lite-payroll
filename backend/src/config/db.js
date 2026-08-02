const { Pool } = require("pg");
require("dotenv").config();

// const pool = new Pool({
//   user: process.env.DB_USER || "postgres",
//   host: process.env.DB_HOST || "localhost",
//   database: process.env.DB_NAME || "postgres",
//   password: process.env.DB_PASSWORD || "Krishna@108",
//   port: process.env.DB_PORT || 5432,
// });

const pool = new Pool({
  // Use the environment variable, but default to 'db' for Docker
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "postgres",
  database: process.env.DB_NAME || "paycraft",
  password: process.env.DB_PASSWORD || "Krishna@108",
  port: process.env.DB_PORT || 5432,
});

const testDB = async () => {
  try {
    const client = await pool.connect();
    console.log("🎉 Database connected successfully!");
    client.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
};

// Update this part to export a 'query' helper
module.exports = {
  pool,
  testDB,
  query: (text, params) => pool.query(text, params), // Add this line
};
