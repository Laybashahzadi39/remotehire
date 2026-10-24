"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// ---------- SEEKER: apply karna ----------
export async function applyToJob(formData: FormData) {
  const session = await requireRole("SEEKER"); // sirf seeker apply kar sakta hai
  const jobId = String(formData.get("jobId"));

  // Job LIVE honi chahiye
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "LIVE") redirect("/jobs");

  // Dobara apply na ho
  const exists = await prisma.application.findUnique({
    where: { jobId_seekerId: { jobId, seekerId: session.userId } },
  });
  if (!exists) {
    await prisma.application.create({ data: { jobId, seekerId: session.userId } });
  }

  redirect("/dashboard/seeker");
} 

// ---------- EMPLOYER: status badalna ----------
const StatusSchema = z.enum(["PENDING", "REVIEWED", "INTERVIEW", "REJECTED"]);

export async function updateApplicationStatus(formData: FormData) {
  const session = await requireRole("EMPLOYER");
  const applicationId = String(formData.get("applicationId"));
  console.log("UPDATE clicked:", applicationId, formData.get("status"));

  // Status sahi value hai?
  const status = StatusSchema.safeParse(formData.get("status"));
  if (!status.success) {
    console.log("Invalid status value");
    return;
  }

  // Sirf apni job ki application badal sakta hai
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });
  if (!app || app.job.employerId !== session.userId) {
    console.log("Not allowed: application missing or job is not yours");
    return;
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: status.data },
  });
  console.log("Status updated to", status.data);

  revalidatePath(`/dashboard/employer/${app.jobId}`);
  revalidatePath("/dashboard/seeker");
}