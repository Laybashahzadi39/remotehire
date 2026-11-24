import { connection } from "next/server";

// Public pages: sirf LIVE jobs jo expire nahi hui
export async function liveJobFilter() {
  await connection(); // current time dynamic hai (Cache Components ke liye zaroori)
  const now = new Date();
  return {
    status: "LIVE" as const,
    AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
  };
}

// Job 30 din live rehti hai
export function newExpiryDate() {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}