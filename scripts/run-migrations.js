/**
 * Run SQL migrations against Supabase Postgres.
 *
 * Usage:
 *   npm run db:migrate
 *
 * Requires:
 *   SUPABASE_DB_URL in .env.local
 */
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    });
}

async function run() {
  const { Client } = require("pg");

  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error(`
Missing SUPABASE_DB_URL in .env.local

Add this line:
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.jrdoyghmqyzfprldnvky.supabase.co:5432/postgres
`);
    process.exit(1);
  }

  const migrationsDir = path.join(__dirname, "..", "supabase", "migrations");
  if (!fs.existsSync(migrationsDir)) {
    console.error("No migrations directory found at supabase/migrations");
    process.exit(1);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found.");
    process.exit(0);
  }

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log("Connected to Supabase.\n");

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");
      console.log(`Running ${file}...`);
      try {
        await client.query(sql);
        console.log(`  OK ${file}\n`);
      } catch (err) {
        if (
          err.message.includes("already exists") ||
          err.code === "42P07" ||
          err.code === "42710"
        ) {
          console.log(`  SKIP (already applied): ${file}\n`);
        } else {
          throw err;
        }
      }
    }

    console.log("All migrations completed.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
