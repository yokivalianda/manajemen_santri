const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env" });

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  try {
    console.log("Dropping tables...");
    await libsql.execute("PRAGMA foreign_keys = OFF;");
    await libsql.execute("DROP TABLE IF EXISTS HalqohSantri;");
    await libsql.execute("DROP TABLE IF EXISTS Santri;");
    await libsql.execute("DROP TABLE IF EXISTS Halqoh;");
    
    console.log("Creating tables...");
    await libsql.execute(`
      CREATE TABLE Santri (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        kelas TEXT NOT NULL,
        jilid INTEGER NOT NULL,
        halaman INTEGER NOT NULL,
        hafalan TEXT NOT NULL,
        status TEXT NOT NULL
      );
    `);
    
    await libsql.execute(`
      CREATE TABLE Halqoh (
        id TEXT PRIMARY KEY,
        nama_kelompok TEXT NOT NULL,
        kapasitas INTEGER NOT NULL
      );
    `);
    
    await libsql.execute(`
      CREATE TABLE HalqohSantri (
        id TEXT PRIMARY KEY,
        santriId TEXT NOT NULL,
        halqohId TEXT NOT NULL,
        FOREIGN KEY (santriId) REFERENCES Santri (id) ON DELETE CASCADE,
        FOREIGN KEY (halqohId) REFERENCES Halqoh (id) ON DELETE CASCADE
      );
    `);
    
    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

main();
