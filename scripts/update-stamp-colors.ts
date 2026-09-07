import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const p = new PrismaClient({ adapter });
const colors: Record<string, string> = {
  RAKSHAK: "#E65100",
  "JAL-MITRA": "#00695C",
  SHIKHAR: "#546E7A",
  "VAN-RAKSHAK": "#2E7D32",
  "SAGAR-MITRA": "#1565C0",
  PRABHAT: "#C44400",
  SETU: "#6D4C41",
};

async function main() {
  for (const [code, color] of Object.entries(colors)) {
    await p.stamp.update({ where: { code }, data: { color } });
  }
  const rows = await p.stamp.findMany({
    select: { code: true, color: true },
    orderBy: { tier: "asc" },
  });
  console.log(rows.map((r) => `${r.code}=${r.color}`).join(" | "));
}

main()
  .then(() => p.$disconnect())
  .catch((e) => {
    console.error("ERR", e);
    process.exit(1);
  });
