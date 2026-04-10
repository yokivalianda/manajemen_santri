-- CreateTable
CREATE TABLE "Santri" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "usia" INTEGER NOT NULL,
    "jilid" INTEGER NOT NULL,
    "halaman" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Halqoh" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama_kelompok" TEXT NOT NULL,
    "kapasitas" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "HalqohSantri" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "santriId" TEXT NOT NULL,
    "halqohId" TEXT NOT NULL,
    CONSTRAINT "HalqohSantri_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HalqohSantri_halqohId_fkey" FOREIGN KEY ("halqohId") REFERENCES "Halqoh" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
