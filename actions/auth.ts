"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { getClientIp, isBlocked, addHit, clearHits, limitOnce } from "@/lib/rate-limit";
import { sendVerification } from "@/lib/verification";
export type FormState = { error?: string } | undefined;

const MINUTE = 60;

// "Too many attempts. Please try again in 15 minutes."
function waitMessage(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

// ---------- SIGNUP ----------
const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SEEKER", "EMPLOYER"]), // ADMIN cannot be created from sign-up
});

export async function signup(prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = SignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password, role } = parsed.data;

  // Rate limit: 5 sign-ups per hour from one IP address
  const ip = await getClientIp();
  const allowed = await limitOnce(`signup:${ip}`, 5, 60 * MINUTE);
  if (!allowed.ok) return { error: waitMessage(allowed.retryAfter) };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "An account with this email already exists" };

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hashed, role } });
  await sendVerification(user.id, user.email);

  redirect("/check-email");
}

// ---------- LOGIN ----------
const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export async function login(prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, password } = parsed.data;

  // Two keys: one for this email + IP, one for this IP with any email
  const ip = await getClientIp();
  const emailKey = `login:${email.toLowerCase()}|${ip}`;
  const ipKey = `login-ip:${ip}`;

  // 1. Is the visitor locked out already?
  const emailStatus = await isBlocked(emailKey, 5);
  const ipStatus = await isBlocked(ipKey, 20);
  if (emailStatus.blocked || ipStatus.blocked) {
    return { error: waitMessage(Math.max(emailStatus.retryAfter, ipStatus.retryAfter)) };
  }

  // 2. Find the user and compare the password
  const user = await prisma.user.findUnique({ where: { email } });
  const match = user ? await bcrypt.compare(password, user.password) : false;

  // 3. Wrong login: count the failed attempt (same message for both cases)
  if (!user || !match) {
    await addHit(emailKey, 15 * MINUTE);
    await addHit(ipKey, 15 * MINUTE);
    return { error: "Invalid email or password" };
  }

  if (!user.emailVerified) {
    return { error: "Please confirm your email first. Check your inbox, or use 'Resend verification email'." };
  }

  // 4. Correct login: reset the counter and start the session
  await clearHits(emailKey);
  await createSession(user.id, user.role);
  redirect("/dashboard");
}

// ---------- LOGOUT ----------
export async function logout() {
  await deleteSession();
  redirect("/login");
}