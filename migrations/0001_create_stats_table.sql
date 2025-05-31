-- CreateTable
CREATE TABLE "Stat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "app" TEXT NOT NULL,
    "totalProjectsGenerated" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectGeneratedStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "framework" TEXT NOT NULL,
    "genCount" INTEGER NOT NULL DEFAULT 0,
    "statId" TEXT NOT NULL,
    CONSTRAINT "ProjectGeneratedStat_statId_fkey" FOREIGN KEY ("statId") REFERENCES "Stat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
