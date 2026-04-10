import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const namaList = [
  "Ahmad Farhan", "Muhammad Rizky", "Abdullah Zaki", "Umar Faruq", "Ali Habib",
  "Ibrahim Salam", "Yusuf Hakim", "Hasan Basri", "Husain Nabil", "Aqil Mubarak",
  "Sulaiman Fauzi", "Dawud Ashari", "Idris Mukhlis", "Ismail Karim", "Nuh Ridho",
  "Isa Tawfiq", "Yahya Syahid", "Zakaria Amin", "Ayub Shabir", "Ilyas Fikri",
  "Luqman Hakim", "Musa Siddiq", "Fitri Nur", "Anwar Ghazali", "Bilal Ramadhan",
  "Salman Faisi", "Taufik Hidayat", "Wahyu Akbar", "Zubair Hafidz", "Hamzah Adil",
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.halqohSantri.deleteMany();
  await prisma.halqoh.deleteMany();
  await prisma.santri.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      username: "admin",
      password: adminPassword,
      role: "ADMIN"
    }
  });

  // Create User
  const userPassword = await bcrypt.hash("user123", 10);
  await prisma.user.create({
    data: {
      username: "user",
      password: userPassword,
      role: "USER"
    }
  });

  console.log("✅ Seeded Admin and User accounts successfully.");

  // Create 30 santri
  const kelasOptions = ["Pra Sekolah", "SD", "SMP", "SMA", "Kuliah"];
  const statusOptions = ["Sedang Belajar", "Lulus Jilid", "Lulus Khatam"];
  const kategoriOptions = ["lambat", "sedang", "cepat"];

  const santriData = namaList.map((nama) => ({
    nama,
    kelas: kelasOptions[randomBetween(0, kelasOptions.length - 1)],
    jilid: randomBetween(1, 3),
    halaman: randomBetween(1, 40),
    hafalan: "Juz 30",
    status: statusOptions[randomBetween(0, 1)],
    kategori: kategoriOptions[randomBetween(0, kategoriOptions.length - 1)],
  }));

  for (const data of santriData) {
    await prisma.santri.create({ data });
  }

  console.log(`✅ Seeded ${santriData.length} santri successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
