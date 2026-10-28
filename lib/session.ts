import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const key = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(key);

  const jar = await cookies();
  jar.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getSession() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;

  // 1. Cookie asli hai?
  let userId: string;
  try {
    const { payload } = await jwtVerify(token, key);
    userId = payload.userId as string;
  } catch {
    return null;
  }

  // 2. User abhi database mein hai aur block nahi? (purani cookie se bhi block user andar nahi aa sakta)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, blocked: true },
  });
  if (!user || user.blocked) return null;

  return { userId, role: user.role as string };
}

export async function deleteSession() {
  (await cookies()).delete("session");
}