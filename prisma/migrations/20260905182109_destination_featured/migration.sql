-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Destination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hindiName" TEXT,
    "region" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "heroImage" TEXT,
    "coordinates" TEXT,
    "mapX" REAL,
    "mapY" REAL,
    "bestSeason" TEXT,
    "knownFor" TEXT NOT NULL,
    "needsCare" TEXT,
    "careImage" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Destination" ("bestSeason", "careImage", "coordinates", "createdAt", "heroImage", "hindiName", "id", "image", "imageAlt", "knownFor", "mapX", "mapY", "name", "needsCare", "region", "slug", "story", "tagline") SELECT "bestSeason", "careImage", "coordinates", "createdAt", "heroImage", "hindiName", "id", "image", "imageAlt", "knownFor", "mapX", "mapY", "name", "needsCare", "region", "slug", "story", "tagline" FROM "Destination";
DROP TABLE "Destination";
ALTER TABLE "new_Destination" RENAME TO "Destination";
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
