"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { screenJob } from "@/lib/scam";
import type { FormState } from "@/actions/auth";

const JobSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters"),
  company: z.string().min(2, "Enter the company name"),
  location: z.string().min(2, "Enter a location, for example Remote"),
  workMode: z.enum(["REMOTE", "HYBRID", "ONSITE"]),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
  salary: z.string().optional(),
  description: z.string().min(30, "Description must be at least 30 characters"),
});

const BLOCK_MESSAGE =
  "This job appears to ask applicants for money. Employers must never charge applicants, so it cannot be posted.";

// ---------- Nayi job ----------
export async function createJob(prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireRole("EMPLOYER");

  const parsed = JobSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Scam check: title + description
  const screen = screenJob(`${parsed.data.title} ${parsed.data.description}`);
  if (screen === "BLOCK") return { error: BLOCK_MESSAGE };

  const employer = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { trusted: true },
  });

  await prisma.job.create({
    data: {
      ...parsed.data,
      salary: parsed.data.salary || null,
      employerId: session.userId,
      // Shak wali job trusted employer ki bhi review mein jati hai
      status: screen === "REVIEW" ? "PENDING" : employer?.trusted ? "LIVE" : "PENDING",
    },
  });

  revalidatePath("/jobs");
  redirect("/dashboard/employer");
}

// ---------- Job edit ----------
export async function updateJob(prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireRole("EMPLOYER");
  const jobId = String(formData.get("jobId"));

  const parsed = JobSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const screen = screenJob(`${parsed.data.title} ${parsed.data.description}`);
  if (screen === "BLOCK") return { error: BLOCK_MESSAGE };

  // Sirf apni job edit ho sakti hai
  const job = await prisma.job.findFirst({ where: { id: jobId, employerId: session.userId } });
  if (!job) return { error: "Job not found" };

  await prisma.job.update({
    where: { id: jobId },
    data: {
      ...parsed.data,
      salary: parsed.data.salary || null,
      status: screen === "REVIEW" || job.status === "REJECTED" ? "PENDING" : job.status,
    },
  });

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  redirect("/dashboard/employer");
}

// ---------- Close / Reopen ----------
export async function toggleJobOpen(formData: FormData) {
  const session = await requireRole("EMPLOYER");
  const jobId = String(formData.get("jobId"));

  const job = await prisma.job.findFirst({ where: { id: jobId, employerId: session.userId } });
  if (!job) return;

  if (job.status === "LIVE") {
    await prisma.job.update({ where: { id: jobId }, data: { status: "CLOSED" } });
  } else if (job.status === "CLOSED") {
    await prisma.job.update({ where: { id: jobId }, data: { status: "LIVE" } });
  }

  revalidatePath("/dashboard/employer");
  revalidatePath("/jobs");
}