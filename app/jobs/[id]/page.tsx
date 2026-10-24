import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { applyToJob } from "@/actions/applications";
import CompanyAvatar from "@/components/CompanyAvatar";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";

// Side card ki ek line (label + value)
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
  const applied =
    session?.role === "SEEKER"
      ? await prisma.application.findUnique({
          where: { jobId_seekerId: { jobId: id, seekerId: session.userId } },
        })
      : null;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/jobs" className="text-sm font-semibold text-teal-300">← Back to jobs</Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: role ki detail */}
        <article className="rounded-2xl border border-[#22345A] bg-[#142544] p-8">
          <div className="flex items-center gap-4">
            <CompanyAvatar name={job.company} large />
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">{job.title}</h1>
              <p className="mt-1 text-[#A9B8D2]">{job.company}</p>
            </div>
          </div>
          <h2 className="mt-10 text-xs font-semibold uppercase tracking-widest text-[#7D8DAA]">About the role</h2>
          <p className="mt-3 whitespace-pre-line leading-7 text-[#C9D5EA]">{job.description}</p>
        </article>

        {/* Right: details + Apply (scroll par sath rehta hai) */}
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

            {session?.role === "SEEKER" &&
              (applied ? (
                <div className="rounded-lg bg-[#0E1A2F] p-4 text-center">
                  <p className="mb-2 text-sm text-[#A9B8D2]">You applied for this job</p>
                  <StatusBadge status={applied.status} />
                </div>
              ) : (
                <form action={applyToJob}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <button className="w-full rounded-lg bg-teal-300 py-3 font-bold text-[#0E1A2F]">Apply now</button>
                </form>
              ))}

            {session && session.role !== "SEEKER" && (
              <p className="text-center text-sm text-[#A9B8D2]">Only job seekers can apply.</p>
            )}
          </div>
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