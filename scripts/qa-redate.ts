import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Redate one event to today at 06:30 local (default: Riverbank Seva Morning)
  const slug = process.argv[2] ?? "riverbank-seva-morning";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 30, 0);

  const event = await prisma.restorationEvent.update({
    where: { slug },
    data: { date: today, status: "OPEN" },
    select: { id: true, title: true, date: true, checkinCode: true, slug: true },
  });
  console.log("redated:", JSON.stringify(event));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());