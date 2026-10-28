"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export type ProfileState = { error?: string; success?: string } | undefined;

const ProfileSchema = z.object({
  headline: z.string().max(100, "Headline must be 100 characters or less"),
  location: z.string().max(80, "Location must be 80 characters or less"),
  skills: z.string().max(200, "Skills must be 200 characters or less"),
  summary: z.string().max(600, "Summary must be 600 characters or less"),
});

// ---------- Profile save ----------
export async function saveProfile(prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await requireRole("SEEKER");

  const parsed = ProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // upsert = profile hai to update, nahi hai to naya bana do
  await prisma.profile.upsert({
    where: { userId: session.userId },
    update: parsed.data,
    create: { userId: session.userId, ...parsed.data },
  });

  revalidatePath("/dashboard/seeker/profile");
  return { success: "Profile saved" };
}

// ---------- Resume upload ----------
const MAX_SIZE = 1_000_000; // ~1 MB

export async function uploadResume(prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await requireRole("SEEKER");

  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a PDF file" };
  if (file.size > MAX_SIZE) return { error: "Resume must be smaller than 1 MB" };

  const bytes = new Uint8Array(await file.arrayBuffer());

  // Asli PDF "%PDF" se shuru hoti hai (sirf file ke naam par bharosa nahi karte)
  const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  if (!isPdf) return { error: "Only PDF files are allowed" };

  const resumeName = file.name.slice(0, 100);
  await prisma.profile.upsert({
    where: { userId: session.userId },
    update: { resumeName, resumeData: bytes },
    create: { userId: session.userId, resumeName, resumeData: bytes },
  });

  revalidatePath("/dashboard/seeker/profile");
  return { success: "Resume uploaded" };
}

// ---------- Resume delete ----------
export async function deleteResume() {
  const session = await requireRole("SEEKER");
  await prisma.profile.updateMany({
    where: { userId: session.userId },
    data: { resumeName: null, resumeData: null },
  });
  revalidatePath("/dashboard/seeker/profile");
}