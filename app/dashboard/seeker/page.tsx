import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { withdrawApplication } from "@/actions/applications";
import CompanyAvatar from "@/components/CompanyAvatar";
import StatusBadge from "@/components/StatusBadge";

const FINAL = ["HIRED", "REJECTED", "WITHDRAWN"];

async function MyApplications() {
  const session = await requireRole("SEEKER");
  const apps = await prisma.application.findMany({
    where: { seekerId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { job: true },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My applications</h1>
          <p className="mt-1 text-muted">{apps.length} total</p>
        </div>
        <Link href="/jobs" className="rounded-full bg-accent px-5 py-3 font-extrabold text-on-accent">Browse jobs</Link>
      </div>

      {apps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-12 text-center">
          <p className="text-lg font-semibold">No applications yet</p>
          <p className="mt-1 text-muted">Find a role you like and apply in one click.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-5">
              <Link href={`/jobs/${a.jobId}`} className="flex min-w-0 flex-1 items-center gap-4 hover:opacity-90">
                <CompanyAvatar name={a.job.company} />
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold">{a.job.title}</p>
                  <p className="text-sm text-muted">{a.job.company} · {a.job.location}</p>
                </div>
              </Link>
              <StatusBadge status={a.status} />

              {/* Withdraw: jab tak Hired / Rejected / Withdrawn na ho */}
              {!FINAL.includes(a.status) && (
                <form action={withdrawApplication}>
                  <input type="hidden" name="applicationId" value={a.id} />
                  <button className="rounded-full border border-line px-4 py-2 text-sm font-bold hover:border-accent">
                    Withdraw
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SeekerPage() {
  return (
    <main className="min-h-[calc(100vh-68px)] bg-bg px-4 py-10 text-fg">
      <Suspense fallback={<p>Loading...</p>}>
        <MyApplications />
      </Suspense>
    </main>
  );
}