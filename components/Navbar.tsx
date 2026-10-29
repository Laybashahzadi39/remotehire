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
    ? await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } })
    : null;

  // Links ek hi baar banate hain, desktop aur mobile dono mein wahi use hote hain
  const links = !session ? (
    <>
      <Link href="/jobs" className={linkStyle}>Browse jobs</Link>
      <Link href="/login" className={linkStyle}>Log in</Link>
      <Link href="/signup" className="rounded-full bg-accent px-5 py-2 text-center text-sm font-extrabold text-on-accent">
        Sign up
      </Link>
    </>
  ) : (
    <>
      {session.role === "SEEKER" && (
        <>
          <Link href="/jobs" className={linkStyle}>Browse jobs</Link>
          <Link href="/dashboard/seeker" className={linkStyle}>My applications</Link>
          <Link href="/dashboard/seeker/profile" className={linkStyle}>My profile</Link>
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

      <span className="max-w-40 truncate text-sm text-faint">
        {user?.name} · {session.role.toLowerCase()}
      </span>

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
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-fg">
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






































// import { Suspense } from "react";
// import Link from "next/link";
// import { getSession } from "@/lib/session";
// import { prisma } from "@/lib/prisma";
// import { logout } from "@/actions/auth";
// import MobileMenu from "@/components/MobileMenu";

// const linkStyle = "text-sm font-medium text-[#C9D5EA] hover:text-white";

// async function NavLinks() {
//   const session = await getSession();
//   const user = session
//     ? await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } })
//     : null;

//   // Links ek hi baar banate hain, desktop aur mobile dono mein wahi use hote hain
//   const links = !session ? (
//     <>
//       <Link href="/jobs" className={linkStyle}>Browse jobs</Link>
//       <Link href="/login" className={linkStyle}>Log in</Link>
//       <Link href="/signup" className="rounded-lg bg-teal-300 px-4 py-2 text-center text-sm font-bold text-[#0E1A2F]">
//         Sign up
//       </Link>
//     </>
//   ) : (
//     <>
//       {session.role === "SEEKER" && (
//         <>
//           <Link href="/jobs" className={linkStyle}>Browse jobs</Link>
//           <Link href="/dashboard/seeker" className={linkStyle}>My applications</Link>
//           <Link href="/dashboard/seeker/profile" className={linkStyle}>My profile</Link>
//         </>
//       )}
//       {session.role === "EMPLOYER" && (
//         <>
//           <Link href="/dashboard/employer" className={linkStyle}>My jobs</Link>
//           <Link href="/dashboard/employer/new-job" className={linkStyle}>Post a job</Link>
//         </>
//       )}
//       {session.role === "ADMIN" && (
//         <Link href="/dashboard/admin" className={linkStyle}>Admin panel</Link>
//       )}

//       <span className="max-w-40 truncate text-sm text-[#7D8DAA]">
//         {user?.name} · {session.role.toLowerCase()}
//       </span>

//       <form action={logout}>
//         <button className="rounded-lg border border-[#3A5287] px-4 py-2 text-sm font-semibold text-[#E8EEF8] hover:border-teal-300">
//           Log out
//         </button>
//       </form>
//     </>
//   );

//   return (
//     <>
//       {/* Bade screen: seedhi line mein */}
//       <div className="hidden items-center gap-5 md:flex">{links}</div>
//       {/* Chhoti screen: hamburger */}
//       <MobileMenu>{links}</MobileMenu>
//     </>
//   );
// }

// export default function Navbar() {
//   return (
//     <header className="sticky top-0 z-50 border-b border-[#22345A] bg-[#0E1A2F]/95 backdrop-blur">
//       <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
//         <Link href="/" className="text-lg font-extrabold text-[#E8EEF8]">RemoteHire</Link>
//         <nav className="flex items-center gap-5">
//           <Suspense fallback={null}>
//             <NavLinks />
//           </Suspense>
//         </nav>
//       </div>
//     </header>
//   );
// }