import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CompanyAvatar from "@/components/CompanyAvatar";
import { formatDate } from "@/lib/format";

type Props = { searchParams: Promise<{ q?: string }> };

async function JobList({ searchParams }: Props) {
  const { q } = await searchParams; // ?q=react se search word

  const jobs = await prisma.job.findMany({
    where: {
      status: "LIVE", // sirf approved jobs
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { company: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <p className="mb-4 text-sm text-[#A9B8D2]">
        {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
        {q ? ` for "${q}"` : ""}
      </p>

      {/* Empty state */}
      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2A4070] bg-[#142544] p-12 text-center">
          <p className="text-lg font-semibold">No jobs found</p>
          <p className="mt-1 text-[#A9B8D2]">Try a different keyword.</p>
          <Link href="/jobs" className="mt-5 inline-block font-semibold text-teal-300">Clear search</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-[#22345A] bg-[#142544] p-5 transition hover:-translate-y-0.5 hover:border-teal-300"
            >
              <CompanyAvatar name={job.company} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold group-hover:text-teal-300">{job.title}</p>
                <p className="text-sm text-[#A9B8D2]">{job.company}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-[#1C3260] px-3 py-1 text-[#BFD0EE]">{job.location}</span>
                  {job.salary && (
                    <span className="rounded-full bg-[#1C3260] px-3 py-1 text-[#BFD0EE]">{job.salary}</span>
                  )}
                  <span className="px-1 font-normal text-[#7D8DAA]">Posted {formatDate(job.createdAt)}</span>
                </div>
              </div>
              <span className="hidden font-bold text-teal-300 sm:block">View →</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default function JobsPage({ searchParams }: Props) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#0E1A2F] px-4 py-12 text-[#E8EEF8]">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-extrabold tracking-tight">Find your next role</h1>
        <p className="mb-8 mt-2 text-[#A9B8D2]">Browse approved jobs from verified employers.</p>

        <form action="/jobs" className="mb-8 flex gap-3 rounded-2xl border border-[#2A4070] bg-[#142544] p-3">
          <input
            name="q"
            placeholder="Search by title, company or skill"
            className="h-12 flex-1 rounded-lg bg-[#0E1A2F] px-4 outline-none placeholder:text-[#7D8DAA] focus:ring-1 focus:ring-teal-300"
          />
          <button className="h-12 rounded-lg bg-teal-300 px-8 font-bold text-[#0E1A2F]">Search</button>
        </form>

        <Suspense fallback={<p className="text-[#A9B8D2]">Loading jobs...</p>}>
          <JobList searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}