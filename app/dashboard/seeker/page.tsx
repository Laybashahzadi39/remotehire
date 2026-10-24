import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import CompanyAvatar from "@/components/CompanyAvatar";
import StatusBadge from "@/components/StatusBadge";

async function MyApplications() {
  const session = await requireRole("SEEKER");
  const apps = await prisma.application.findMany({
    where: { seekerId: session.userId },
    include: { job: true }, // har application ke sath job ki details
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My applications</h1>
          <p className="mt-1 text-[#A9B8D2]">{apps.length} total</p>
        </div>
        <Link href="/jobs" className="rounded-lg bg-teal-300 px-5 py-3 font-bold text-[#0E1A2F]">Browse jobs</Link>
      </div>

      {apps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2A4070] bg-[#142544] p-12 text-center">
          <p className="text-lg font-semibold">No applications yet</p>
          <p className="mt-1 text-[#A9B8D2]">Find a role you like and apply in one click.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((a) => (
            <Link
              key={a.id}
              href={`/jobs/${a.jobId}`}
              className="flex items-center gap-4 rounded-2xl border border-[#22345A] bg-[#142544] p-5 transition hover:border-teal-300"
            >
              <CompanyAvatar name={a.job.company} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold">{a.job.title}</p>
                <p className="text-sm text-[#A9B8D2]">{a.job.company} · {a.job.location}</p>
              </div>
              <StatusBadge status={a.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SeekerPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#0E1A2F] px-4 py-10 text-[#E8EEF8]">
      <Suspense fallback={<p>Loading...</p>}>
        <MyApplications />
      </Suspense>
    </main>
  );
}