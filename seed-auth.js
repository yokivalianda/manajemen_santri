const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding admin and user...");

  const existingAdmin = await prisma.user.findUnique({ where: { username: "admin" } });
  if (!existingAdmin) {
    const adminPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        username: "admin",
        password: adminPassword,
        role: "ADMIN"
      }
    });
    console.log("Admin seeded.");
  } else {
    console.log("Admin already exists.");
  }

  const existingUser = await prisma.user.findUnique({ where: { username: "user" } });
  if (!existingUser) {
    const userPassword = await bcrypt.hash("user123", 10);
    await prisma.user.create({
      data: {
        username: "user",
        password: userPassword,
        role: "USER"
      }
    });
    console.log("User seeded.");
  } else {
    console.log("User already exists.");
  }
  
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
