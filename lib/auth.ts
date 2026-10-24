import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Page ko role ke hisaab se protect karta hai
export async function requireRole(role: "SEEKER" | "EMPLOYER" | "ADMIN") {
  const session = await getSession();
  if (!session) redirect("/login");            // login nahi to login par bhejo
  if (session.role !== role) redirect("/dashboard"); // galat role to dashboard par
  return session;
}