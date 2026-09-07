-- CreateTable
CREATE TABLE "LitterReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketCode" TEXT NOT NULL,
    "userId" TEXT,
    "spotName" TEXT NOT NULL,
    "region" TEXT,
    "category" TEXT NOT NULL,
    "volume" TEXT NOT NULL,
    "description" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "hasPhoto" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DISPATCHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LitterReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LitterReport_ticketCode_key" ON "LitterReport"("ticketCode");

-- CreateIndex
CREATE INDEX "LitterReport_status_createdAt_idx" ON "LitterReport"("status", "createdAt");
