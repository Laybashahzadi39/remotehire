"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp, limitOnce } from "@/lib/rate-limit";

export type ContactState = { error?: string; success?: string } | undefined;

const ContactSchema = z.object({
  name: z.string().min(2, "Enter your name").max(80, "Name is too long"),
  email: z.string().email("Enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
  website: z.string().max(0).optional(), // honeypot: bots isey bhar dete hain, insaan nahi
});

export async function sendContact(prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = ContactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, message } = parsed.data;

  // Rate limit: ek IP se 3 messages per hour
  const ip = await getClientIp();
  const allowed = await limitOnce(`contact:${ip}`, 3, 3600);
  if (!allowed.ok) return { error: "Too many messages. Please try again later." };

  await prisma.contactMessage.create({ data: { name, email, message } });
  return { success: "Thank you. We received your message and will reply by email." };
}