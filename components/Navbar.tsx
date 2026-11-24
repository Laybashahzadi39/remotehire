import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { logout } from "@/actions/auth";
import MobileMenu from "@/components/MobileMenu";
import ThemeToggle from "@/components/ThemeToggle";

const linkStyle = "text-sm font-semibold text-muted hover:text-fg";

async function NavLinks() {
  const session = await getSession();
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true },
      })
    : null;
  // Unread notifications ki ginti (bell ke upar badge)
  const unread = session
    ? await prisma.notification.count({
        where: { userId: session.userId, readAt: null },
      })
    : 0;

  const links = !session ? (
    <>
      <Link href="/jobs" className={linkStyle}>
        Browse jobs
      </Link>
      <Link href="/login" className={linkStyle}>
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-full bg-accent px-5 py-2 text-center text-sm font-extrabold text-on-accent"
      >
        Sign up
      </Link>
    </>
  ) : (
    <>
      {session.role === "SEEKER" && (
        <>
          <Link href="/jobs" className={linkStyle}>
            Browse jobs
          </Link>
          <Link href="/dashboard/seeker" className={linkStyle}>
            My applications
          </Link>
          <Link href="/dashboard/seeker/profile" className={linkStyle}>
            My profile
          </Link>
        </>
      )}
      {session.role === "EMPLOYER" && (
        <>
          <Link href="/dashboard/employer" className={linkStyle}>
            My jobs
          </Link>
          <Link href="/dashboard/employer/new-job" className={linkStyle}>
            Post a job
          </Link>
        </>
      )}
      {session.role === "ADMIN" && (
        <>
          <Link href="/dashboard/admin" className={linkStyle}>
            Admin panel
          </Link>
          <Link href="/dashboard/admin/messages" className={linkStyle}>
            Messages
          </Link>
          <Link href="/dashboard/admin/audit" className={linkStyle}>
            Audit log
          </Link>
        </>
      )}

      {/* Notification bell */}
      <Link
        href="/notifications"
        aria-label="Notifications"
        className="flex items-center gap-2 text-muted hover:text-fg"
      >
        <span className="relative">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />
          </svg>
          {unread > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-extrabold text-on-accent">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
        <span className="text-sm font-semibold md:hidden">Notifications</span>
      </Link>

      <span className="max-w-64 truncate text-sm text-faint">{user?.name}</span>

      <form action={logout}>
        <button className="rounded-full border border-line px-4 py-2 text-sm font-bold text-fg hover:border-accent">
          Log out
        </button>
      </form>
    </>
  );

  return (
    <>
      <div className="hidden items-center gap-5 md:flex">{links}</div>
      <MobileMenu>{links}</MobileMenu>
    </>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-extrabold text-fg"
        >
          <span className="h-7 w-7 rounded-full bg-accent" />
          RemoteHire
        </Link>
        <nav className="flex items-center gap-3 md:gap-5">
          <ThemeToggle />
          <Suspense fallback={null}>
            <NavLinks />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
