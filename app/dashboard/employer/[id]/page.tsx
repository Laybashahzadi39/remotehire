import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { updateApplicationStatus } from "@/actions/applications";
import { formatDate } from "@/lib/format";

// Employer in stages ko chun sakta hai (WITHDRAWN sirf candidate ka hai)
const STATUSES = ["PENDING", "REVIEWED", "SHORTLISTED", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];
// Contact masking: email sirf in stages par dikhti hai
const EMAIL_STAGES = ["INTERVIEW", "OFFER", "HIRED"];
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

async function Applicants({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("EMPLOYER");
  const { id } = await params;

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
      <Link href="/dashboard/employer" className="text-sm font-bold text-accent-ink">← Back to my jobs</Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{job.title}</h1>
      <p className="mb-8 text-muted">{job.applications.length} applicant(s)</p>

      {job.applications.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-12 text-center text-muted">
          No one has applied yet.
        </div>
      )}

      <div className="space-y-5">
        {job.applications.map((a) => {
          const p = a.seeker.profile;
          const skills = p?.skills?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

          return (
            <div key={a.id} className="rounded-2xl border border-line bg-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold">{a.seeker.name}</p>
                  {p?.headline && <p className="text-fg">{p.headline}</p>}
                  <p className="text-sm text-muted">
                    {EMAIL_STAGES.includes(a.status) ? a.seeker.email : "Email hidden until the Interview stage"}
                    {p?.location ? ` · ${p.location}` : ""} · Applied {formatDate(a.createdAt)}
                  </p>
                </div>

                {a.status === "WITHDRAWN" ? (
                  <span className="rounded-full bg-slate-400/15 px-3 py-1.5 text-xs font-extrabold text-slate-300">
                    Withdrawn by candidate
                  </span>
                ) : (
                  <form action={updateApplicationStatus} className="flex items-center gap-3">
                    <input type="hidden" name="applicationId" value={a.id} />
                    <select name="status" defaultValue={a.status} className="rounded-full border border-line bg-bg px-4 py-2 text-sm">
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{label(s)}</option>
                      ))}
                    </select>
                    <button className="rounded-full bg-accent px-4 py-2 text-sm font-extrabold text-on-accent">Update</button>
                  </form>
                )}
              </div>

              {skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="rounded-full bg-chip px-3 py-1 text-xs font-bold text-chip-fg">{s}</span>
                  ))}
                </div>
              )}

              {p?.summary && <p className="mt-4 text-sm leading-6 text-muted">{p.summary}</p>}

              {a.coverNote && (
                <div className="mt-4 rounded-xl bg-bg p-4">
                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-faint">Cover note</p>
                  <p className="whitespace-pre-line text-sm leading-6 text-muted">{a.coverNote}</p>
                </div>
              )}

              {p?.resumeName && (
                <a href={`/api/resume/${a.seeker.id}`} target="_blank" className="mt-4 inline-block text-sm font-bold text-accent-ink">
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
    <main className="min-h-[calc(100vh-68px)] bg-bg px-4 py-10 text-fg">
      <Suspense fallback={<p>Loading...</p>}>
        <Applicants params={params} />
      </Suspense>
    </main>
  );
}