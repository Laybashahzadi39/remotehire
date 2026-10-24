"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// Job approve: PENDING -> LIVE
export async function approveJob(formData: FormData) {
  await requireRole("ADMIN"); // sirf admin kar sakta hai
  const jobId = String(formData.get("jobId"));
  await prisma.job.update({ where: { id: jobId }, data: { status: "LIVE" } });
  revalidatePath("/dashboard/admin"); // page ka data dobara load
}

// Job reject: CLOSED
export async function rejectJob(formData: FormData) {
  await requireRole("ADMIN");
  const jobId = String(formData.get("jobId"));
  await prisma.job.update({ where: { id: jobId }, data: { status: "CLOSED" } });
  revalidatePath("/dashboard/admin");
}