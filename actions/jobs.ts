"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import type { FormState } from "@/actions/auth";

const JobSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters"),
  company: z.string().min(2, "Enter the company name"),
  location: z.string().min(2, "Enter a location, for example Remote"),
  salary: z.string().optional(),
  description: z.string().min(30, "Description must be at least 30 characters"),
});

export async function createJob(prev: FormState, formData: FormData): Promise<FormState> {
  // Server par bhi role check (sirf page chhupana kaafi nahi hota)
  const session = await requireRole("EMPLOYER");

  const parsed = JobSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  await prisma.job.create({
    data: {
      title: data.title,
      company: data.company,
      location: data.location,
      salary: data.salary || null,   // khali ho to null
      description: data.description,
      employerId: session.userId,    // status khud PENDING rahega
    },
  });

  redirect("/dashboard/employer");
}