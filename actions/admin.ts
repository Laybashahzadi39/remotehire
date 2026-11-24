"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { audit } from "@/lib/audit";
import { newExpiryDate } from "@/lib/job-filter";

function refresh() {
  revalidatePath("/dashboard/admin");
  revalidatePath("/jobs");
}

// ---------- Job approval ----------
export async function approveJob(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const jobId = String(formData.get("jobId"));

  const job = await prisma.job.update({
    where: { id: jobId },
    data: { status: "LIVE", expiresAt: newExpiryDate() },
  });
  await prisma.user.update({ where: { id: job.employerId }, data: { trusted: true } });
  await notify(job.employerId, `Your job "${job.title}" was approved and is now live`, "/dashboard/employer");
  await audit(admin.userId, "JOB_APPROVED", "JOB", jobId, job.title);
  refresh();
}

export async function rejectJob(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const jobId = String(formData.get("jobId"));

  const job = await prisma.job.update({ where: { id: jobId }, data: { status: "REJECTED" } });
  await notify(job.employerId, `Your job "${job.title}" was rejected. Edit it and it will be reviewed again`, "/dashboard/employer");
  await audit(admin.userId, "JOB_REJECTED", "JOB", jobId, job.title);
  refresh();
}

// ---------- Reports ----------
export async function takeDownJob(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const jobId = String(formData.get("jobId"));

  const job = await prisma.job.update({ where: { id: jobId }, data: { status: "REJECTED" } });
  await prisma.report.updateMany({ where: { jobId, status: "OPEN" }, data: { status: "RESOLVED" } });
  await notify(job.employerId, `Your job "${job.title}" was removed after reports`, "/dashboard/employer");
  await audit(admin.userId, "JOB_TAKEN_DOWN", "JOB", jobId, job.title);
  refresh();
}

export async function dismissReports(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const jobId = String(formData.get("jobId"));

  await prisma.report.updateMany({ where: { jobId, status: "OPEN" }, data: { status: "DISMISSED" } });
  await prisma.job.updateMany({ where: { id: jobId, status: "HIDDEN" }, data: { status: "LIVE" } });
  await audit(admin.userId, "REPORTS_DISMISSED", "JOB", jobId);
  refresh();
}

// ---------- Users ----------
export async function blockUser(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const userId = String(formData.get("userId"));

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "ADMIN") return;

  await prisma.user.update({ where: { id: userId }, data: { blocked: true } });
  await prisma.job.updateMany({ where: { employerId: userId, status: "LIVE" }, data: { status: "CLOSED" } });
  await audit(admin.userId, "USER_BLOCKED", "USER", userId, user.email);
  refresh();
}

export async function unblockUser(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const userId = String(formData.get("userId"));

  const user = await prisma.user.update({ where: { id: userId }, data: { blocked: false } });
  await audit(admin.userId, "USER_UNBLOCKED", "USER", userId, user.email);
  refresh();
}