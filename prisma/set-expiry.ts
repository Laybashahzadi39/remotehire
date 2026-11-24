import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const r = await prisma.job.updateMany({
    where: { status: "LIVE", expiresAt: null },
    data: { expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  });
  console.log("Set expiry for", r.count, "live jobs.");
}

main().finally(() => prisma.$disconnect());