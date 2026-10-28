"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type ReportState = { error?: string; success?: string } | undefined;

// Itni alag reports ke baad job khud chhup jati hai, admin final faisla karta hai.
// 2 demo ke liye hai, asli site par 3 se 5 rakhte hain.
const AUTO_HIDE_AT = 2;

const ReportSchema = z.object({
  jobId: z.string().min(1),
  reason: z.enum(["ASKS_FOR_MONEY", "FAKE_COMPANY", "MISLEADING", "OTHER"]),
  details: z.string().max(300, "Details must be 300 characters or less").optional(),
});

export async function reportJob(prev: ReportState, formData: FormData): Promise<ReportState> {
  const session = await getSession();
  if (!session) return { error: "Log in to report a job" };

  const parsed = ReportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { jobId, reason, details } = parsed.data;

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "LIVE") return { error: "This job is not available" };
  if (job.employerId === session.userId) return { error: "You cannot report your own job" };

  // Ek user ek job ko ek hi baar report kar sakta hai
  const already = await prisma.report.findUnique({
    where: { jobId_reporterId: { jobId, reporterId: session.userId } },
  });
  if (already) return { error: "You have already reported this job" };

  await prisma.report.create({
    data: { jobId, reporterId: session.userId, reason, details: details || null },
  });

  // Alag alag users ki open reports gino; limit par job hide
  const openReports = await prisma.report.count({ where: { jobId, status: "OPEN" } });
  if (openReports >= AUTO_HIDE_AT) {
    await prisma.job.update({ where: { id: jobId }, data: { status: "HIDDEN" } });
  }

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard/admin");
  return { success: "Thanks. Our team will review this job." };
}