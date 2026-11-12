"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// ---------- SEEKER: apply ----------
export async function applyToJob(formData: FormData) {
  const session = await requireRole("SEEKER");
  const jobId = String(formData.get("jobId"));
  const coverNote = String(formData.get("coverNote") ?? "").trim().slice(0, 1000);

  // Resume ke bina apply nahi
  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
    select: { resumeName: true },
  });
  if (!profile?.resumeName) redirect("/dashboard/seeker/profile");

  // Job LIVE honi chahiye
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "LIVE") redirect("/jobs");

  // Dobara apply na ho
  const exists = await prisma.application.findUnique({
    where: { jobId_seekerId: { jobId, seekerId: session.userId } },
  });
  if (!exists) {
    await prisma.application.create({
      data: { jobId, seekerId: session.userId, coverNote: coverNote || null },
    });
  }

  redirect("/dashboard/seeker");
}

// ---------- SEEKER: withdraw ----------
const FINAL = ["HIRED", "REJECTED", "WITHDRAWN"]; // inke baad withdraw nahi

export async function withdrawApplication(formData: FormData) {
  const session = await requireRole("SEEKER");
  const applicationId = String(formData.get("applicationId"));

  // Sirf apni application (ownership check)
  const app = await prisma.application.findFirst({
    where: { id: applicationId, seekerId: session.userId },
  });
  if (!app || FINAL.includes(app.status)) return;

  await prisma.application.update({ where: { id: app.id }, data: { status: "WITHDRAWN" } });

  revalidatePath("/dashboard/seeker");
  revalidatePath(`/dashboard/employer/${app.jobId}`);
}

// ---------- EMPLOYER: status badalna ----------
// WITHDRAWN list mein nahi: wo sirf candidate kar sakta hai
const StatusSchema = z.enum([
  "PENDING",
  "REVIEWED",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
]);

export async function updateApplicationStatus(formData: FormData) {
  const session = await requireRole("EMPLOYER");
  const applicationId = String(formData.get("applicationId"));

  const status = StatusSchema.safeParse(formData.get("status"));
  if (!status.success) return;

  // Sirf apni job ki application
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });
  if (!app || app.job.employerId !== session.userId) return;

  // Candidate ne withdraw kiya ho to employer badal nahi sakta
  if (app.status === "WITHDRAWN") return;

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: status.data },
  });

  revalidatePath(`/dashboard/employer/${app.jobId}`);
  revalidatePath("/dashboard/seeker");
}