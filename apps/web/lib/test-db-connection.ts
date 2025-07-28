import { Pool } from "pg";

// Use environment variable for connection string
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("[DB TEST] ❌ DATABASE_URL environment variable is not set.");
} else {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    family: 4, // Prefer IPv4
  });

  (async () => {
    try {
      const res = await pool.query("SELECT NOW()");
      console.log("\n[DB TEST] ✅ Database connection successful!");
      console.log("    Current time from DB:", res.rows[0].now);
      await pool.end();
    } catch (err) {
      console.error("\n[DB TEST] ❌ Database connection failed!");
      console.error("    Error:", err);
    }
  })();
}
