const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 4000, // TiDB default is 4000
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // --- THIS BLOCK IS REQUIRED FOR TIDB CLOUD ---
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false,
  },
});

console.log("✅ MySQL Database pool initialized (SSL enabled)");

module.exports = db;
