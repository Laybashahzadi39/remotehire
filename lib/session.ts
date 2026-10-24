import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Secret se cookie par "mohar" lagti hai, koi aur fake cookie nahi bana sakta
const key = new TextEncoder().encode(process.env.SESSION_SECRET);

// Login ke baad cookie banao
export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(key);

  const jar = await cookies();
  jar.set("session", token, {
    httpOnly: true, // JavaScript se cookie chori nahi ho sakti
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

// Cookie parh kar bataye kaun logged in hai
export async function getSession() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return { userId: payload.userId as string, role: payload.role as string };
  } catch {
    return null; // cookie fake ya expire
  }
}

// Logout
export async function deleteSession() {
  (await cookies()).delete("session");
}