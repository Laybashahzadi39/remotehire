import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import ApplyForm from "@/components/ApplyForm";
import CompanyAvatar from "@/components/CompanyAvatar";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";
import ReportJob from "@/components/ReportJob";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#22345A] py-3 text-sm last:border-0">
      <span className="text-[#A9B8D2]">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job || job.status !== "LIVE") notFound();

  const session = await getSession();
  const isSeeker = session?.role === "SEEKER";

  // Seeker ke liye: pehle apply kiya? resume hai?
  const applied = isSeeker
    ? await prisma.application.findUnique({
        where: { jobId_seekerId: { jobId: id, seekerId: session.userId } },
      })
    : null;
  const profile = isSeeker
    ? await prisma.profile.findUnique({
        where: { userId: session.userId },
        select: { resumeName: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/jobs" className="text-sm font-semibold text-teal-300">← Back to jobs</Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <article className="rounded-2xl border border-[#22345A] bg-[#142544] p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <CompanyAvatar name={job.company} large />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{job.title}</h1>
              <p className="mt-1 text-[#A9B8D2]">{job.company}</p>
            </div>
          </div>
          <h2 className="mt-10 text-xs font-semibold uppercase tracking-widest text-[#7D8DAA]">About the role</h2>
          <p className="mt-3 whitespace-pre-line leading-7 text-[#C9D5EA]">{job.description}</p>
        </article>

        <aside className="h-fit rounded-2xl border border-[#22345A] bg-[#142544] p-6 lg:sticky lg:top-24">
          <Detail label="Location" value={job.location} />
          <Detail label="Salary" value={job.salary ?? "Not specified"} />
          <Detail label="Posted" value={formatDate(job.createdAt)} />

          <div className="mt-6">
            {!session && (
              <Link href="/login" className="block rounded-lg bg-teal-300 py-3 text-center font-bold text-[#0E1A2F]">
                Log in to apply
              </Link>
            )}

            {isSeeker &&
              (applied ? (
                <div className="rounded-lg bg-[#0E1A2F] p-4 text-center">
                  <p className="mb-2 text-sm text-[#A9B8D2]">You applied for this job</p>
                  <StatusBadge status={applied.status} />
                </div>
              ) : (
                <ApplyForm jobId={job.id} hasResume={!!profile?.resumeName} />
              ))}

            {session && !isSeeker && (
              <p className="text-center text-sm text-[#A9B8D2]">Only job seekers can apply.</p>
            )}
          </div>
                    {session && <ReportJob jobId={job.id} />}
        </aside>
      </div>
    </div>
  );
}

export default function JobPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#0E1A2F] px-4 py-10 text-[#E8EEF8]">
      <Suspense fallback={<p>Loading...</p>}>
        <JobDetail params={params} />
      </Suspense>
    </main>
  );
}