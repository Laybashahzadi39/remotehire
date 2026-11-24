import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import ApplyForm from "@/components/ApplyForm";
import ReportJob from "@/components/ReportJob";
import CompanyAvatar from "@/components/CompanyAvatar";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-3 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-bold">{value}</span>
    </div>
  );
}

async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });

  // Job LIVE honi chahiye aur expire nahi
  if (!job || job.status !== "LIVE" || (job.expiresAt && job.expiresAt < new Date())) notFound();

  const session = await getSession();
  const isSeeker = session?.role === "SEEKER";

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
      <Link href="/jobs" className="text-sm font-bold text-accent-ink">← Back to jobs</Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <article className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <CompanyAvatar name={job.company} large />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{job.title}</h1>
              <p className="mt-1 text-muted">{job.company}</p>
            </div>
          </div>
          <h2 className="mt-10 text-xs font-bold uppercase tracking-widest text-faint">About the role</h2>
          <p className="mt-3 whitespace-pre-line leading-7 text-muted">{job.description}</p>
        </article>

        <aside className="h-fit rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-24">
          <Detail label="Location" value={job.location} />
          <Detail label="Salary" value={job.salary ?? "Not specified"} />
          <Detail label="Posted" value={formatDate(job.createdAt)} />

          <div className="mt-6">
            {!session && (
              <Link href="/login" className="block rounded-full bg-accent py-3 text-center font-extrabold text-on-accent">
                Log in to apply
              </Link>
            )}

            {isSeeker &&
              (applied ? (
                <div className="rounded-2xl bg-bg p-4 text-center">
                  <p className="mb-2 text-sm text-muted">You applied for this job</p>
                  <StatusBadge status={applied.status} />
                </div>
              ) : (
                <ApplyForm jobId={job.id} hasResume={!!profile?.resumeName} />
              ))}

            {session && !isSeeker && <p className="text-center text-sm text-muted">Only job seekers can apply.</p>}
          </div>

          {session && <ReportJob jobId={job.id} />}
        </aside>
      </div>
    </div>
  );
}

export default function JobPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="min-h-[calc(100vh-68px)] bg-bg px-4 py-10 text-fg">
      <Suspense fallback={<p>Loading...</p>}>
        <JobDetail params={params} />
      </Suspense>
    </main>
  );
}