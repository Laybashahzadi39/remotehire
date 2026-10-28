import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const CATEGORIES = ["Frontend", "Backend", "Full-stack", "Design", "Product", "Marketing"];

// Latest 3 LIVE jobs database se (isliye Suspense ke andar)
async function FeaturedJobs() {
  const jobs = await prisma.job.findMany({
    where: { status: "LIVE" },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  if (jobs.length === 0) {
    return <p className="text-[#A9B8D2]">No jobs yet. Check back soon.</p>;
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {jobs.map((job) => (
        <Link
          key={job.id}
          href={`/jobs/${job.id}`}
          className="flex flex-col gap-4 rounded-2xl border border-[#22345A] bg-[#142544] p-6 transition hover:border-teal-300"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#22345A] font-extrabold text-teal-300">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold">{job.title}</p>
              <p className="text-sm text-[#A9B8D2]">{job.company}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-[#1C3260] px-3 py-1 text-[#BFD0EE]">{job.location}</span>
            {job.salary && <span className="rounded-full bg-[#1C3260] px-3 py-1 text-[#BFD0EE]">{job.salary}</span>}
          </div>
          <span className="mt-auto text-sm font-bold text-teal-300">View job →</span>
        </Link>
      ))}
    </div>
  );
}

const ROLES = [
  {
    title: "Job seekers",
    text: "Create a profile, apply in one click, and follow every application from Pending to Interview.",
    points: ["Search and filter jobs", "Application status tracking", "One account, all applications"],
  },
  {
    title: "Employers",
    text: "Post roles in minutes, review applicants, and move the best candidates forward.",
    points: ["Post and manage listings", "See every applicant", "Update status in one click"],
  },
  {
    title: "Admins",
    text: "Keep the platform trusted by reviewing jobs before they go live.",
    points: ["Job approval queue", "User overview", "Platform statistics"],
  },
];

export default function Home() {
  return (
    <main className="bg-[#0E1A2F] text-[#E8EEF8]">
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center">
        <span className="rounded-full border border-[#2A4070] bg-[#13233F] px-4 py-2 text-sm font-semibold text-teal-300">
          Remote-first job board
        </span>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Find work you love,<br />from anywhere in the world.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#A9B8D2]">
          Browse verified remote and on-site roles, track every application, and hear back faster.
        </p>

        {/* Search: /jobs?q=... par bhejta hai */}
        <form action="/jobs" className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl border border-[#2A4070] bg-[#142544] p-3 sm:flex-row">
          <input
            name="q"
            placeholder="Job title, company or skill"
            className="h-12 w-full rounded-lg bg-[#0E1A2F] px-4 outline-none placeholder:text-[#7D8DAA] sm:flex-1"
          />
          <button className="h-12 rounded-lg bg-teal-300 px-8 font-bold text-[#0E1A2F]">Search jobs</button>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          <span className="py-2 text-[#9FB0CC]">Popular:</span>
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/jobs?q=${c}`} className="rounded-full border border-[#2A4070] px-4 py-2 text-[#C9D5EA] hover:border-teal-300">
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured jobs */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold">Featured jobs</h2>
            <p className="mt-1 text-[#A9B8D2]">Approved roles from verified employers.</p>
          </div>
          <Link href="/jobs" className="font-semibold text-teal-300">View all jobs →</Link>
        </div>
        <Suspense fallback={<p className="text-[#A9B8D2]">Loading jobs...</p>}>
          <FeaturedJobs />
        </Suspense>
      </section>

      {/* Three roles */}
      <section className="border-y border-[#22345A] bg-[#0A1425]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-extrabold">One platform, three dashboards</h2>
          <p className="mx-auto mb-12 mt-2 max-w-lg text-center text-[#A9B8D2]">
            Every role gets a workspace built for the job they need to do.
          </p>
          <div className="grid gap-5 md:grid-cols-3">
            {ROLES.map((r) => (
              <div key={r.title} className="rounded-2xl border border-[#22345A] bg-[#142544] p-7">
                <h3 className="text-xl font-bold">{r.title}</h3>
                <p className="mt-3 leading-relaxed text-[#A9B8D2]">{r.text}</p>
                <ul className="mt-5 space-y-2 text-sm text-[#C9D5EA]">
                  {r.points.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="rounded-3xl border border-[#2A4070] bg-[#142544] px-6 py-14 text-center">
          <h2 className="text-3xl font-extrabold">Ready for your next role?</h2>
          <p className="mx-auto mt-3 max-w-md text-[#A9B8D2]">
            Create a free profile today, or post your first job and start receiving applications.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="rounded-lg bg-teal-300 px-7 py-3 font-bold text-[#0E1A2F]">Find a job</Link>
            <Link href="/signup" className="rounded-lg border border-[#3A5287] px-7 py-3 font-bold">Post a job</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#22345A] px-4 py-8 text-center text-sm text-[#9FB0CC]">
        © RemoteHire. All rights reserved.
      </footer>
    </main>
  );
}