"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { notify } from "@/lib/notify";

const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase(); // "SHORTLISTED" -> "Shortlisted"

// ---------- SEEKER: apply ----------
export async function applyToJob(formData: FormData) {
  const session = await requireRole("SEEKER");
  const jobId = String(formData.get("jobId"));
  const coverNote = String(formData.get("coverNote") ?? "").trim().slice(0, 1000);

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
    select: { resumeName: true },
  });
  if (!profile?.resumeName) redirect("/dashboard/seeker/profile");

  // Job LIVE honi chahiye aur expire nahi hui
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "LIVE") redirect("/jobs");
  if (job.expiresAt && job.expiresAt < new Date()) redirect("/jobs");

  const exists = await prisma.application.findUnique({
    where: { jobId_seekerId: { jobId, seekerId: session.userId } },
  });
  if (!exists) {
    await prisma.application.create({
      data: { jobId, seekerId: session.userId, coverNote: coverNote || null },
    });
    // Employer ko batao
    await notify(job.employerId, `New application for "${job.title}"`, `/dashboard/employer/${job.id}`);
  }

  redirect("/dashboard/seeker");
}

// ---------- SEEKER: withdraw ----------
const FINAL = ["HIRED", "REJECTED", "WITHDRAWN"];

export async function withdrawApplication(formData: FormData) {
  const session = await requireRole("SEEKER");
  const applicationId = String(formData.get("applicationId"));

  const app = await prisma.application.findFirst({
    where: { id: applicationId, seekerId: session.userId },
    include: { job: true },
  });
  if (!app || FINAL.includes(app.status)) return;

  await prisma.application.update({ where: { id: app.id }, data: { status: "WITHDRAWN" } });
  await notify(app.job.employerId, `A candidate withdrew from "${app.job.title}"`, `/dashboard/employer/${app.jobId}`);

  revalidatePath("/dashboard/seeker");
  revalidatePath(`/dashboard/employer/${app.jobId}`);
}

// ---------- EMPLOYER: status badalna ----------
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

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });
  if (!app || app.job.employerId !== session.userId) return;
  if (app.status === "WITHDRAWN") return;

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: status.data },
  });

  // Seeker ko sirf tab batao jab status sach mein badla ho
  if (app.status !== status.data) {
    await notify(
      app.seekerId,
      `Your application for "${app.job.title}" is now ${label(status.data)}`,
      "/dashboard/seeker"
    );
  }

  revalidatePath(`/dashboard/employer/${app.jobId}`);
  revalidatePath("/dashboard/seeker");
}