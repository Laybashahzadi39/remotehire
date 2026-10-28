import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { updateApplicationStatus } from "@/actions/applications";
import { formatDate } from "@/lib/format";

const STATUSES = ["PENDING", "REVIEWED", "INTERVIEW", "REJECTED"];

async function Applicants({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("EMPLOYER");
  const { id } = await params;

  // Job meri honi chahiye; applicants ke sath unki profile (resume bytes ke bina)
  const job = await prisma.job.findFirst({
    where: { id, employerId: session.userId },
    include: {
      applications: {
        orderBy: { createdAt: "desc" },
        include: {
          seeker: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: { select: { headline: true, location: true, skills: true, summary: true, resumeName: true } },
            },
          },
        },
      },
    },
  });
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard/employer" className="text-sm font-semibold text-teal-300">← Back to my jobs</Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{job.title}</h1>
      <p className="mb-8 text-[#A9B8D2]">{job.applications.length} applicant(s)</p>

      {job.applications.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#2A4070] bg-[#142544] p-12 text-center text-[#A9B8D2]">
          No one has applied yet.
        </div>
      )}

      <div className="space-y-5">
        {job.applications.map((a) => {
          const p = a.seeker.profile;
          const skills = p?.skills?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

          return (
            <div key={a.id} className="rounded-2xl border border-[#22345A] bg-[#142544] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold">{a.seeker.name}</p>
                  {p?.headline && <p className="text-[#C9D5EA]">{p.headline}</p>}
                  <p className="text-sm text-[#A9B8D2]">
                    {a.seeker.email}
                    {p?.location ? ` · ${p.location}` : ""} · Applied {formatDate(a.createdAt)}
                  </p>
                </div>

                {/* Status badalne ka form */}
                <form action={updateApplicationStatus} className="flex items-center gap-3">
                  <input type="hidden" name="applicationId" value={a.id} />
                  <select name="status" defaultValue={a.status} className="rounded-lg border border-[#2A4070] bg-[#0E1A2F] px-3 py-2 text-sm">
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button className="rounded-lg bg-teal-300 px-4 py-2 text-sm font-bold text-[#0E1A2F]">Update</button>
                </form>
              </div>

              {skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="rounded-full bg-[#1C3260] px-3 py-1 text-xs font-semibold text-[#BFD0EE]">{s}</span>
                  ))}
                </div>
              )}

              {p?.summary && <p className="mt-4 text-sm leading-6 text-[#C9D5EA]">{p.summary}</p>}

              {a.coverNote && (
                <div className="mt-4 rounded-lg bg-[#0E1A2F] p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#7D8DAA]">Cover note</p>
                  <p className="whitespace-pre-line text-sm leading-6 text-[#C9D5EA]">{a.coverNote}</p>
                </div>
              )}

              {p?.resumeName && (
                <a href={`/api/resume/${a.seeker.id}`} target="_blank" className="mt-4 inline-block text-sm font-semibold text-teal-300">
                  View resume ({p.resumeName}) →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#0E1A2F] px-4 py-10 text-[#E8EEF8]">
      <Suspense fallback={<p>Loading...</p>}>
        <Applicants params={params} />
      </Suspense>
    </main>
  );
}