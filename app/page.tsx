










import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CompanyAvatar from "@/components/CompanyAvatar";

const CATEGORIES = ["Frontend", "Backend", "Design", "Marketing"];

// Latest 3 LIVE jobs database se
async function FeaturedJobs() {
  const jobs = await prisma.job.findMany({
    where: { status: "LIVE" },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  if (jobs.length === 0) return <p className="text-muted">No jobs yet. Check back soon.</p>;

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {jobs.map((job) => (
        <Link
          key={job.id}
          href={`/jobs/${job.id}`}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 transition hover:border-accent"
        >
          <div className="flex items-center gap-3">
            <CompanyAvatar name={job.company} />
            <div className="min-w-0">
              <p className="truncate font-bold">{job.title}</p>
              <p className="text-sm text-muted">{job.company}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-chip px-3 py-1 text-chip-fg">{job.location}</span>
            {job.salary && <span className="rounded-full bg-chip px-3 py-1 text-chip-fg">{job.salary}</span>}
          </div>
          <span className="mt-auto text-sm font-extrabold text-accent-ink">View job →</span>
        </Link>
      ))}
    </div>
  );
}

const FEATURES = [
  { title: "Approved listings", text: "Every job is reviewed before it goes live.", d: "M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3zM9 12l2 2 4-4" },
  { title: "Track every application", text: "See Pending, Interview or Rejected at a glance.", d: "M4 6h16M4 12h16M4 18h10" },
  { title: "Hear back faster", text: "Employers update statuses right inside the platform.", d: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2" },
];

const ROLES = [
  { title: "Job seekers", text: "Build a profile, upload your resume and apply in one click.", points: ["Search and filter jobs", "Private resume upload", "Application status tracking"] },
  { title: "Employers", text: "Post roles in minutes and move the best candidates forward.", points: ["Post, edit and close jobs", "See every applicant", "Update status in one click"] },
  { title: "Admins", text: "Keep the platform trusted by reviewing jobs and reports.", points: ["Job approval queue", "Report review and take-down", "User blocking"] },
];

export default function Home() {
  return (
    <main className="bg-bg text-fg">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <span className="inline-block rounded-full border border-line bg-raised px-4 py-1.5 text-sm font-bold text-accent-ink">
            Remote-first job board
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Your next remote role starts here.
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
            Browse verified jobs, apply in one click and follow every application until you hear back.
          </p>

          {/* Search: /jobs?q=... par bhejta hai */}
          <form action="/jobs" className="mt-8 flex max-w-lg gap-2 rounded-full border border-line bg-surface p-2">
            <input
              name="q"
              placeholder="Job title, company or skill"
              aria-label="Job title, company or skill"
              className="h-11 min-w-0 flex-1 bg-transparent px-4 text-fg outline-none placeholder:text-faint"
            />
            <button className="h-11 rounded-full bg-accent px-6 font-extrabold text-on-accent">Search</button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-semibold">
            <span className="text-faint">Popular</span>
            {CATEGORIES.map((c) => (
              <Link key={c} href={`/jobs?q=${c}`} className="text-muted hover:text-fg">{c}</Link>
            ))}
          </div>
        </div>

        {/* Sirf bade screen par: sample cards jo product dikhate hain */}
        <div className="relative hidden h-[380px] lg:block" aria-hidden="true">
          <div className="absolute left-12 top-0 w-80 rounded-2xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-3">
              <CompanyAvatar name="Northwind Labs" />
              <div><p className="font-extrabold">Senior React Developer</p><p className="text-sm text-muted">Northwind Labs</p></div>
            </div>
            <div className="mt-4 flex gap-2 text-xs font-bold"><span className="rounded-full bg-chip px-3 py-1 text-chip-fg">Remote</span><span className="rounded-full bg-chip px-3 py-1 text-chip-fg">Full-time</span></div>
            <p className="mt-4 text-sm font-extrabold">$4,000 - $6,000 / month</p>
          </div>
          <div className="absolute left-32 top-32 w-80 rounded-2xl border border-line bg-raised p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div><p className="font-extrabold">UI/UX Designer</p><p className="text-sm text-muted">Pixel &amp; Co</p></div>
              <span className="rounded-full bg-accent/20 px-3 py-1.5 text-xs font-extrabold text-accent-ink">Interview</span>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-line"><div className="h-1.5 w-[70%] rounded-full bg-accent" /></div>
            <p className="mt-2 text-xs text-muted">Application status updated today</p>
          </div>
          <div className="absolute left-2 top-64 w-72 rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-extrabold">Node.js Backend Engineer</p><p className="text-xs text-muted">Brightpath</p></div>
              <span className="rounded-full bg-chip px-3 py-1.5 text-xs font-extrabold text-chip-fg">Pending</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-y border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:grid-cols-3 sm:px-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-4">
              <svg className="h-6 w-6 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={f.d} /></svg>
              <div><p className="font-extrabold">{f.title}</p><p className="text-sm leading-relaxed text-muted">{f.text}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured jobs */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Featured jobs</h2>
            <p className="mt-1 text-muted">Approved roles from verified employers.</p>
          </div>
          <Link href="/jobs" className="font-bold text-accent-ink">View all jobs →</Link>
        </div>
        <Suspense fallback={<p className="text-muted">Loading jobs...</p>}>
          <FeaturedJobs />
        </Suspense>
      </section>

      {/* Roles */}
      <section className="border-y border-line bg-surface/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight">One platform, three dashboards</h2>
          <p className="mx-auto mb-10 mt-2 max-w-lg text-center text-muted">Every role gets a workspace built for the job they need to do.</p>
          <div className="grid gap-5 md:grid-cols-3">
            {ROLES.map((r) => (
              <div key={r.title} className="rounded-2xl border border-line bg-surface p-7">
                <h3 className="text-xl font-extrabold">{r.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{r.text}</p>
                <ul className="mt-5 space-y-2 text-sm text-fg">
                  {r.points.map((p) => (<li key={p}>• {p}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-line bg-surface px-6 py-14 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready for your next role?</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">Create a free profile today, or post your first job and start receiving applications.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="rounded-full bg-accent px-7 py-3 font-extrabold text-on-accent">Find a job</Link>
            <Link href="/signup" className="rounded-full border border-line px-7 py-3 font-extrabold hover:border-accent">Post a job</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-4 py-8 text-center text-sm text-faint">
        © RemoteHire. All rights reserved.
      </footer>
    </main>
  );
}































































// import { Suspense } from "react";
// import Link from "next/link";
// import { prisma } from "@/lib/prisma";

// const CATEGORIES = ["Frontend", "Backend", "Full-stack", "Design", "Product", "Marketing"];

// // Latest 3 LIVE jobs database se (isliye Suspense ke andar)
// async function FeaturedJobs() {
//   const jobs = await prisma.job.findMany({
//     where: { status: "LIVE" },
//     orderBy: { createdAt: "desc" },
//     take: 3,
//   });

//   if (jobs.length === 0) {
//     return <p className="text-[#A9B8D2]">No jobs yet. Check back soon.</p>;
//   }

//   return (
//     <div className="grid gap-5 md:grid-cols-3">
//       {jobs.map((job) => (
//         <Link
//           key={job.id}
//           href={`/jobs/${job.id}`}
//           className="flex flex-col gap-4 rounded-2xl border border-[#22345A] bg-[#142544] p-6 transition hover:border-teal-300"
//         >
//           <div className="flex items-center gap-3">
//             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#22345A] font-extrabold text-teal-300">
//               {job.company.charAt(0).toUpperCase()}
//             </div>
//             <div>
//               <p className="font-bold">{job.title}</p>
//               <p className="text-sm text-[#A9B8D2]">{job.company}</p>
//             </div>
//           </div>
//           <div className="flex flex-wrap gap-2 text-xs font-semibold">
//             <span className="rounded-full bg-[#1C3260] px-3 py-1 text-[#BFD0EE]">{job.location}</span>
//             {job.salary && <span className="rounded-full bg-[#1C3260] px-3 py-1 text-[#BFD0EE]">{job.salary}</span>}
//           </div>
//           <span className="mt-auto text-sm font-bold text-teal-300">View job →</span>
//         </Link>
//       ))}
//     </div>
//   );
// }

// const ROLES = [
//   {
//     title: "Job seekers",
//     text: "Create a profile, apply in one click, and follow every application from Pending to Interview.",
//     points: ["Search and filter jobs", "Application status tracking", "One account, all applications"],
//   },
//   {
//     title: "Employers",
//     text: "Post roles in minutes, review applicants, and move the best candidates forward.",
//     points: ["Post and manage listings", "See every applicant", "Update status in one click"],
//   },
//   {
//     title: "Admins",
//     text: "Keep the platform trusted by reviewing jobs before they go live.",
//     points: ["Job approval queue", "User overview", "Platform statistics"],
//   },
// ];

// export default function Home() {
//   return (
//     <main className="bg-[#0E1A2F] text-[#E8EEF8]">
//       {/* Hero */}
//       <section className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center">
//         <span className="rounded-full border border-[#2A4070] bg-[#13233F] px-4 py-2 text-sm font-semibold text-teal-300">
//           Remote-first job board
//         </span>
//         <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
//           Find work you love,<br />from anywhere in the world.
//         </h1>
//         <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#A9B8D2]">
//           Browse verified remote and on-site roles, track every application, and hear back faster.
//         </p>

//         {/* Search: /jobs?q=... par bhejta hai */}
//         <form action="/jobs" className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl border border-[#2A4070] bg-[#142544] p-3 sm:flex-row">
//           <input
//             name="q"
//             placeholder="Job title, company or skill"
//             className="h-12 w-full rounded-lg bg-[#0E1A2F] px-4 outline-none placeholder:text-[#7D8DAA] sm:flex-1"
//           />
//           <button className="h-12 rounded-lg bg-teal-300 px-8 font-bold text-[#0E1A2F]">Search jobs</button>
//         </form>

//         <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
//           <span className="py-2 text-[#9FB0CC]">Popular:</span>
//           {CATEGORIES.map((c) => (
//             <Link key={c} href={`/jobs?q=${c}`} className="rounded-full border border-[#2A4070] px-4 py-2 text-[#C9D5EA] hover:border-teal-300">
//               {c}
//             </Link>
//           ))}
//         </div>
//       </section>

//       {/* Featured jobs */}
//       <section className="mx-auto max-w-6xl px-4 py-16">
//         <div className="mb-8 flex items-end justify-between">
//           <div>
//             <h2 className="text-3xl font-extrabold">Featured jobs</h2>
//             <p className="mt-1 text-[#A9B8D2]">Approved roles from verified employers.</p>
//           </div>
//           <Link href="/jobs" className="font-semibold text-teal-300">View all jobs →</Link>
//         </div>
//         <Suspense fallback={<p className="text-[#A9B8D2]">Loading jobs...</p>}>
//           <FeaturedJobs />
//         </Suspense>
//       </section>

//       {/* Three roles */}
//       <section className="border-y border-[#22345A] bg-[#0A1425]">
//         <div className="mx-auto max-w-6xl px-4 py-20">
//           <h2 className="text-center text-3xl font-extrabold">One platform, three dashboards</h2>
//           <p className="mx-auto mb-12 mt-2 max-w-lg text-center text-[#A9B8D2]">
//             Every role gets a workspace built for the job they need to do.
//           </p>
//           <div className="grid gap-5 md:grid-cols-3">
//             {ROLES.map((r) => (
//               <div key={r.title} className="rounded-2xl border border-[#22345A] bg-[#142544] p-7">
//                 <h3 className="text-xl font-bold">{r.title}</h3>
//                 <p className="mt-3 leading-relaxed text-[#A9B8D2]">{r.text}</p>
//                 <ul className="mt-5 space-y-2 text-sm text-[#C9D5EA]">
//                   {r.points.map((p) => (
//                     <li key={p}>• {p}</li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="mx-auto max-w-5xl px-4 py-20">
//         <div className="rounded-3xl border border-[#2A4070] bg-[#142544] px-6 py-14 text-center">
//           <h2 className="text-3xl font-extrabold">Ready for your next role?</h2>
//           <p className="mx-auto mt-3 max-w-md text-[#A9B8D2]">
//             Create a free profile today, or post your first job and start receiving applications.
//           </p>
//           <div className="mt-8 flex flex-wrap justify-center gap-4">
//             <Link href="/signup" className="rounded-lg bg-teal-300 px-7 py-3 font-bold text-[#0E1A2F]">Find a job</Link>
//             <Link href="/signup" className="rounded-lg border border-[#3A5287] px-7 py-3 font-bold">Post a job</Link>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="border-t border-[#22345A] px-4 py-8 text-center text-sm text-[#9FB0CC]">
//         © RemoteHire. All rights reserved.
//       </footer>
//     </main>
//   );
// }