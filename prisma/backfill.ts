import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const jobs = await prisma.job.findMany();
  for (const j of jobs) {
    const loc = j.location.toLowerCase();
    // Location mein "hybrid" / "remote" likha ho to wahi, warna On-site
    const workMode = loc.includes("hybrid") ? "HYBRID" : loc.includes("remote") ? "REMOTE" : "ONSITE";
    await prisma.job.update({ where: { id: j.id }, data: { workMode } });
  }
  console.log("Updated", jobs.length, "jobs");
}

main().finally(() => prisma.$disconnect());