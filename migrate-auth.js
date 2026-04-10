const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env" });

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  try {
    console.log("Creating User table...");
    await libsql.execute(`
      CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'USER' NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

main();
