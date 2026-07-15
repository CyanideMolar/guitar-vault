-- DropIndex
DROP INDEX "CustomFieldValue_guitarId_customFieldId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CustomField";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CustomFieldValue";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "AllowedEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guitar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "bridgePickup" TEXT,
    "neckPickup" TEXT,
    "middlePickup" TEXT,
    "preferredTuning" TEXT,
    "preferredStringGauge" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "notes" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Guitar" ("brand", "createdAt", "id", "imageUrl", "model", "name", "notes", "ownerId", "preferredStringGauge", "serialNumber", "updatedAt") SELECT "brand", "createdAt", "id", "imageUrl", "model", "name", "notes", "ownerId", "preferredStringGauge", "serialNumber", "updatedAt" FROM "Guitar";
DROP TABLE "Guitar";
ALTER TABLE "new_Guitar" RENAME TO "Guitar";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AllowedEmail_email_key" ON "AllowedEmail"("email" ASC);
