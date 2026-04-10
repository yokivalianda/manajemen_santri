const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env" });

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  try {
    await libsql.execute({
      sql: `INSERT INTO User (id, username, password, role) VALUES ('admin-id', 'admin', ?, 'ADMIN') ON CONFLICT(username) DO NOTHING;`,
      args: [adminPassword]
    });
    console.log("Admin seeded into Turso directly.");

    await libsql.execute({
      sql: `INSERT INTO User (id, username, password, role) VALUES ('user-id', 'user', ?, 'USER') ON CONFLICT(username) DO NOTHING;`,
      args: [userPassword]
    });
    console.log("User seeded into Turso directly.");
    
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

main();
