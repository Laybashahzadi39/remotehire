import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // 1. Purana data saaf (order zaroori: applications -> jobs -> users)
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  // 2. Demo accounts
  const hash = (p: string) => bcrypt.hash(p, 10);

  await prisma.user.create({
    data: { name: "Demo Admin", email: "admin@test.com", password: await hash("Admin@123"), role: "ADMIN" },
  });
  const employer = await prisma.user.create({
    data: { name: "Demo Employer", email: "employer@test.com", password: await hash("Employer@123"), role: "EMPLOYER" },
  });
  const seeker = await prisma.user.create({
    data: { name: "Demo Seeker", email: "seeker@test.com", password: await hash("Seeker@123"), role: "SEEKER" },
  });

  // 3. Sample jobs (sab LIVE, taake home aur /jobs bhare hue dikhen)
  const jobs = [
    { title: "Senior React Developer", company: "Northwind Labs", location: "Remote", salary: "$4,000 - $6,000 / month",
      description: "Build and maintain our customer dashboard using React and TypeScript. You will work closely with designers and backend engineers, review code, and help improve performance across the product." },
    { title: "Node.js Backend Engineer", company: "Brightpath", location: "Remote", salary: "$3,500 - $5,000 / month",
      description: "Design REST and GraphQL APIs, optimise database queries, and write reliable automated tests. Experience with PostgreSQL and cloud deployment is a plus." },
    { title: "Full-Stack Developer (Next.js)", company: "Kitepoint", location: "Hybrid · Berlin", salary: "$4,500 - $6,500 / month",
      description: "Own features end to end, from database schema to polished user interface, using Next.js, Prisma and Tailwind CSS in a small, fast-moving product team." },
    { title: "UI/UX Designer", company: "Pixel & Co", location: "Remote", salary: "$3,000 - $4,500 / month",
      description: "Create wireframes, prototypes and design systems for web products. You will run user research sessions and turn findings into clear, accessible interfaces." },
    { title: "Content Creator", company: "Codeoy", location: "Karachi", salary: "$800 - $1,200 / month",
      description: "Plan and produce blog posts, short videos and social media content for a growing developer community, and track what performs best." },
    { title: "Product Marketing Manager", company: "Orbit Labs", location: "Remote", salary: "$4,000 - $5,500 / month",
      description: "Lead product launches, write positioning and messaging, and work with sales and product teams to bring new features to market." },
  ];

  const created = [];
  for (const j of jobs) {
    created.push(await prisma.job.create({ data: { ...j, status: "LIVE", employerId: employer.id } }));
  }

  // 4. Seeker ki 2 applications, alag status (demo mein pipeline dikhane ke liye)
  await prisma.application.create({ data: { jobId: created[0].id, seekerId: seeker.id, status: "INTERVIEW" } });
  await prisma.application.create({ data: { jobId: created[2].id, seekerId: seeker.id, status: "PENDING" } });

  console.log("Seed complete: 3 accounts, 6 jobs, 2 applications.");
}

main().finally(() => prisma.$disconnect());