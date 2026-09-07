import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "meera@example.com" },
    include: {
      attendances: { include: { rsvp: { include: { event: { select: { title: true } } } } } },
      earnedStamps: { include: { stamp: true } },
    },
  });
  if (!user) return console.log("no user");
  console.log("user:", user.name);
  console.log("attendances:", user.attendances.map((a) => ({ at: a.verifiedAt, lat: a.latitude, lng: a.longitude, acc: a.geoAccuracy, event: a.rsvp.event.title })));
  console.log("stamps:", user.earnedStamps.map((s) => s.stamp.name));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());