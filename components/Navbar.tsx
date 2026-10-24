import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { logout } from "@/actions/auth";

const linkStyle = "text-sm font-medium text-[#C9D5EA] hover:text-white";

// Cookie parh kar links chunta hai (isliye Suspense ke andar rakha hai)
async function NavLinks() {
  const session = await getSession();

  // Login nahi hai
  if (!session) {
    return (
      <>
        <Link href="/jobs" className={linkStyle}>Browse jobs</Link>
        <Link href="/login" className={linkStyle}>Log in</Link>
        <Link href="/signup" className="rounded-lg bg-teal-300 px-4 py-2 text-sm font-bold text-[#0E1A2F]">
          Sign up
        </Link>
      </>
    );
  }

  return (
    <>
      {session.role === "SEEKER" && (
        <>
          <Link href="/jobs" className={linkStyle}>Browse jobs</Link>
          <Link href="/dashboard/seeker" className={linkStyle}>My applications</Link>
        </>
      )}
      {session.role === "EMPLOYER" && (
        <>
          <Link href="/dashboard/employer" className={linkStyle}>My jobs</Link>
          <Link href="/dashboard/employer/new-job" className={linkStyle}>Post a job</Link>
        </>
      )}
      {session.role === "ADMIN" && (
        <Link href="/dashboard/admin" className={linkStyle}>Admin panel</Link>
      )}

      {/* Logout har page par */}
      <form action={logout}>
        <button className="rounded-lg border border-[#3A5287] px-4 py-2 text-sm font-semibold text-[#E8EEF8] hover:border-teal-300">
          Log out
        </button>
      </form>
    </>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#22345A] bg-[#0E1A2F]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-extrabold text-[#E8EEF8]">RemoteHire</Link>
        <nav className="flex items-center gap-5">
          <Suspense fallback={null}>
            <NavLinks />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}