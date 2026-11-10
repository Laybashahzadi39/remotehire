"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";
import { getClientIp, limitOnce } from "@/lib/rate-limit";
import { sendVerification, sendPasswordReset } from "@/lib/verification";

export type EmailState = { error?: string; success?: string } | undefined;

const EmailSchema = z.object({ email: z.string().email("Enter a valid email address") });

// ---------- Forgot password ----------
export async function requestReset(prev: EmailState, formData: FormData): Promise<EmailState> {
  const parsed = EmailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const ip = await getClientIp();
  const allowed = await limitOnce(`reset:${ip}`, 5, 3600); // 5 per hour per IP
  if (!allowed.ok) return { error: "Too many requests. Please try again later." };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user && !user.blocked) await sendPasswordReset(user.id, user.email);

  // Same answer whether the email exists or not (no email guessing)
  return { success: "If an account exists for this email, we sent a reset link." };
}

// ---------- Resend the verification email ----------
export async function resendVerification(prev: EmailState, formData: FormData): Promise<EmailState> {
  const parsed = EmailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const ip = await getClientIp();
  const allowed = await limitOnce(`resend:${ip}`, 5, 3600);
  if (!allowed.ok) return { error: "Too many requests. Please try again later." };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user && !user.emailVerified && !user.blocked) await sendVerification(user.id, user.email);

  return { success: "If this account needs verification, we sent a new link." };
}

// ---------- Confirm the email (button on /verify) ----------
export async function verifyEmail(prev: EmailState, formData: FormData): Promise<EmailState> {
  const token = String(formData.get("token") ?? "");
  const row = token
    ? await prisma.emailToken.findUnique({ where: { tokenHash: hashToken(token) } })
    : null;

  if (!row || row.type !== "VERIFY_EMAIL" || row.expiresAt < new Date()) {
    return { error: "This link is invalid or has expired. Please request a new one." };
  }

  await prisma.user.update({ where: { id: row.userId }, data: { emailVerified: new Date() } });
  await prisma.emailToken.deleteMany({ where: { userId: row.userId, type: "VERIFY_EMAIL" } });
  return { success: "Your email is confirmed. You can log in now." };
}

// ---------- Set a new password ----------
const ResetSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

export async function resetPassword(prev: EmailState, formData: FormData): Promise<EmailState> {
  const parsed = ResetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { token, password } = parsed.data;

  const row = await prisma.emailToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!row || row.type !== "RESET_PASSWORD" || row.expiresAt < new Date()) {
    return { error: "This link is invalid or has expired. Please request a new one." };
  }

  await prisma.user.update({
    where: { id: row.userId },
    data: { password: await bcrypt.hash(password, 10), emailVerified: new Date() },
  });
  await prisma.emailToken.deleteMany({ where: { userId: row.userId } }); // all links stop working
  return { success: "Your password was updated. You can log in now." };
}