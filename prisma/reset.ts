import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // Order zaroori hai: pehle applications, phir jobs, phir users
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  // Admin signup se nahi banta, isliye yahan bana dete hain
  await prisma.user.create({
    data: {
      name: "Test Admin",
      email: "admin@test.com",
      password: await bcrypt.hash("Admin@123", 10),
      role: "ADMIN",
    },
  });

  console.log("Database cleared. Admin account created.");
}

main().finally(() => prisma.$disconnect());