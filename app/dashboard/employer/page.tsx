import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { toggleJobOpen, renewJob } from "@/actions/jobs";
import CompanyAvatar from "@/components/CompanyAvatar";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";

async function MyJobs() {
  const session = await requireRole("EMPLOYER");
  const jobs = await prisma.job.findMany({
    where: { employerId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });
  const now = new Date();

  const btn = "rounded-full border border-line px-4 py-2 text-sm font-bold hover:border-accent";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My job listings</h1>
          <p className="mt-1 text-muted">{jobs.length} total</p>
        </div>
        <Link href="/dashboard/employer/new-job" className="rounded-full bg-accent px-5 py-3 font-extrabold text-on-accent">
          Post a job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-12 text-center">
          <p className="text-lg font-semibold">You have not posted any jobs yet</p>
          <p className="mt-1 text-muted">New employers are reviewed once by an admin.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const expired = job.status === "LIVE" && !!job.expiresAt && job.expiresAt < now;

            return (
              <div key={job.id} className="rounded-2xl border border-line bg-surface p-5">
                <Link href={`/dashboard/employer/${job.id}`} className="flex items-center gap-4 hover:opacity-90">
                  <CompanyAvatar name={job.company} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-bold">{job.title}</p>
                    <p className="text-sm text-muted">
                      {job.company} · {job.location} · Posted {formatDate(job.createdAt)}
                      {job.status === "LIVE" && job.expiresAt ? ` · ${expired ? "Expired" : "Expires"} ${formatDate(job.expiresAt)}` : ""}
                    </p>
                  </div>
                  {expired ? (
                    <span className="rounded-full bg-slate-400/15 px-3 py-1 text-xs font-bold text-slate-300">Expired</span>
                  ) : (
                    <StatusBadge status={job.status} />
                  )}
                </Link>

                <div className="mt-4 flex flex-wrap gap-3 border-t border-line pt-4">
                  <Link href={`/dashboard/employer/${job.id}`} className={btn}>
                    Applicants ({job._count.applications})
                  </Link>
                  <Link href={`/dashboard/employer/${job.id}/edit`} className={btn}>Edit</Link>

                  {(job.status === "LIVE" || job.status === "CLOSED") && (
                    <form action={toggleJobOpen}>
                      <input type="hidden" name="jobId" value={job.id} />
                      <button className={btn}>{job.status === "LIVE" ? "Close job" : "Reopen job"}</button>
                    </form>
                  )}

                  {(expired || job.status === "CLOSED") && (
                    <form action={renewJob}>
                      <input type="hidden" name="jobId" value={job.id} />
                      <button className="rounded-full bg-accent px-4 py-2 text-sm font-extrabold text-on-accent">
                        Renew for 30 days
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function EmployerPage() {
  return (
    <main className="min-h-[calc(100vh-68px)] bg-bg px-4 py-10 text-fg">
      <Suspense fallback={<p>Loading...</p>}>
        <MyJobs />
      </Suspense>
    </main>
  );
}