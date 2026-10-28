"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

function refresh() {
  revalidatePath("/dashboard/admin");
  revalidatePath("/jobs");
}

// ---------- Job approval ----------
export async function approveJob(formData: FormData) {
  await requireRole("ADMIN");
  const jobId = String(formData.get("jobId"));

  const job = await prisma.job.update({ where: { id: jobId }, data: { status: "LIVE" } });
  await prisma.user.update({ where: { id: job.employerId }, data: { trusted: true } });
  refresh();
}

export async function rejectJob(formData: FormData) {
  await requireRole("ADMIN");
  const jobId = String(formData.get("jobId"));
  await prisma.job.update({ where: { id: jobId }, data: { status: "REJECTED" } });
  refresh();
}

// ---------- Reports ----------
// Take down: job band, reports resolved
export async function takeDownJob(formData: FormData) {
  await requireRole("ADMIN");
  const jobId = String(formData.get("jobId"));
  await prisma.job.update({ where: { id: jobId }, data: { status: "REJECTED" } });
  await prisma.report.updateMany({ where: { jobId, status: "OPEN" }, data: { status: "RESOLVED" } });
  refresh();
}

// Dismiss: reports ghalat thin, job wapas LIVE (agar auto-hide hui thi)
export async function dismissReports(formData: FormData) {
  await requireRole("ADMIN");
  const jobId = String(formData.get("jobId"));
  await prisma.report.updateMany({ where: { jobId, status: "OPEN" }, data: { status: "DISMISSED" } });
  await prisma.job.updateMany({ where: { id: jobId, status: "HIDDEN" }, data: { status: "LIVE" } });
  refresh();
}

// ---------- Users ----------
export async function blockUser(formData: FormData) {
  await requireRole("ADMIN");
  const userId = String(formData.get("userId"));

  // Admin ko block nahi kar sakte
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "ADMIN") return;

  await prisma.user.update({ where: { id: userId }, data: { blocked: true } });
  // Blocked employer ki live jobs bhi band
  await prisma.job.updateMany({ where: { employerId: userId, status: "LIVE" }, data: { status: "CLOSED" } });
  refresh();
}

export async function unblockUser(formData: FormData) {
  await requireRole("ADMIN");
  const userId = String(formData.get("userId"));
  await prisma.user.update({ where: { id: userId }, data: { blocked: false } });
  refresh();
}