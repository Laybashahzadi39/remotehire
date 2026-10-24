"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

export type FormState = { error?: string } | undefined;

// ---------- SIGNUP ----------
const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SEEKER", "EMPLOYER"]), // ADMIN signup se nahi banega
});

export async function signup(prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = SignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password, role } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "An account with this email already exists" };

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, password: hashed, role } });

  redirect("/login");
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

  // 1. User dhoondo, 2. password match karo
  const user = await prisma.user.findUnique({ where: { email } });
  const match = user ? await bcrypt.compare(password, user.password) : false;

  // Dono galti par ek hi message (security: attacker ko hint nahi milta)
  if (!user || !match) return { error: "Invalid email or password" };

  await createSession(user.id, user.role);
  redirect("/dashboard");
}

// ---------- LOGOUT ----------
export async function logout() {
  await deleteSession();
  redirect("/login");
}