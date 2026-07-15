-- CreateTable
CREATE TABLE "PracticeSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalDurationSeconds" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    CONSTRAINT "PracticeSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PracticeSessionGuitar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "practiceSessionId" TEXT NOT NULL,
    "guitarId" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "PracticeSessionGuitar_practiceSessionId_fkey" FOREIGN KEY ("practiceSessionId") REFERENCES "PracticeSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PracticeSessionGuitar_guitarId_fkey" FOREIGN KEY ("guitarId") REFERENCES "Guitar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "hashedKey" TEXT NOT NULL,
    "label" TEXT,
    "lastUsedAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_hashedKey_key" ON "ApiKey"("hashedKey");
