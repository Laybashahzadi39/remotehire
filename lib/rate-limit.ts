import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// The visitor's IP address (Vercel sends it in the x-forwarded-for header)
export async function getClientIp() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

// Is this key already over its limit? (does NOT count a new attempt)
export async function isBlocked(key: string, max: number) {
  const row = await prisma.rateLimit.findUnique({ where: { key } });
  if (!row || row.resetAt <= new Date() || row.count < max) {
    return { blocked: false, retryAfter: 0 };
  }
  const retryAfter = Math.ceil((row.resetAt.getTime() - Date.now()) / 1000);
  return { blocked: true, retryAfter };
}

// Count one attempt. The first attempt starts a new time window.
export async function addHit(key: string, windowSeconds: number) {
  const now = new Date();
  const row = await prisma.rateLimit.findUnique({ where: { key } });

  if (!row || row.resetAt <= now) {
    const resetAt = new Date(now.getTime() + windowSeconds * 1000);
    await prisma.rateLimit.upsert({
      where: { key },
      update: { count: 1, resetAt },
      create: { key, count: 1, resetAt },
    });
  } else {
    await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  }
}

// Forget the counter (used after a successful login)
export async function clearHits(key: string) {
  await prisma.rateLimit.deleteMany({ where: { key } });
}

// Check + count in one step (for sign-up, apply, report...)
export async function limitOnce(key: string, max: number, windowSeconds: number) {
  const status = await isBlocked(key, max);
  if (status.blocked) return { ok: false, retryAfter: status.retryAfter };
  await addHit(key, windowSeconds);
  return { ok: true, retryAfter: 0 };
}