import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Har role ka apna "ghar"
const HOME = {
  SEEKER: "/dashboard/seeker",
  EMPLOYER: "/dashboard/employer",
  ADMIN: "/dashboard/admin",
} as const;

async function Redirector(): Promise<never> {
  const session = await getSession();
  if (!session) redirect("/login");                       // login nahi to login
  redirect(HOME[session.role as keyof typeof HOME]);      // role ke hisaab se bhejo
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <Redirector />
    </Suspense>
  );
}