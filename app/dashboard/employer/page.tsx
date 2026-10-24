import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import CompanyAvatar from "@/components/CompanyAvatar";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";

async function MyJobs() {
  const session = await requireRole("EMPLOYER");
  const jobs = await prisma.job.findMany({
    where: { employerId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } }, // applicants ginti
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My job listings</h1>
          <p className="mt-1 text-[#A9B8D2]">{jobs.length} total</p>
        </div>
        <Link href="/dashboard/employer/new-job" className="rounded-lg bg-teal-300 px-5 py-3 font-bold text-[#0E1A2F]">
          Post a job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2A4070] bg-[#142544] p-12 text-center">
          <p className="text-lg font-semibold">You have not posted any jobs yet</p>
          <p className="mt-1 text-[#A9B8D2]">New jobs go live after admin approval.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#22345A] bg-[#142544] p-5">
              <CompanyAvatar name={job.company} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold">{job.title}</p>
                <p className="text-sm text-[#A9B8D2]">
                  {job.company} · {job.location} · Posted {formatDate(job.createdAt)}
                </p>
              </div>
              <StatusBadge status={job.status} />
              <Link
                href={`/dashboard/employer/${job.id}`}
                className="rounded-lg border border-[#3A5287] px-4 py-2 text-sm font-semibold hover:border-teal-300"
              >
                Applicants ({job._count.applications})
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmployerPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#0E1A2F] px-4 py-10 text-[#E8EEF8]">
      <Suspense fallback={<p>Loading...</p>}>
        <MyJobs />
      </Suspense>
    </main>
  );
}