import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { updateApplicationStatus } from "@/actions/applications";

const STATUSES = ["PENDING", "REVIEWED", "INTERVIEW", "REJECTED"];

async function Applicants({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("EMPLOYER");
  const { id } = await params;

  // Job meri apni honi chahiye, applicants ke sath
  const job = await prisma.job.findFirst({
    where: { id, employerId: session.userId },
    include: { applications: { include: { seeker: { select: { name: true, email: true } } } } },
  });
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard/employer" className="text-sm text-teal-300">← Back to my jobs</Link>
      <h1 className="mt-4 text-3xl font-bold">{job.title}</h1>
      <p className="mb-8 text-[#A9B8D2]">{job.applications.length} applicant(s)</p>

      {job.applications.length === 0 && <p className="text-[#A9B8D2]">No one has applied yet.</p>}

      <div className="space-y-4">
        {job.applications.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#22345A] bg-[#142544] p-5">
            <div>
              <p className="text-lg font-semibold">{a.seeker.name}</p>
              <p className="text-sm text-[#A9B8D2]">{a.seeker.email}</p>
            </div>

            {/* Status badalne ka chhota form */}
            <form action={updateApplicationStatus} className="flex items-center gap-3">
              <input type="hidden" name="applicationId" value={a.id} />
              <select
                name="status"
                defaultValue={a.status}
                className="rounded-lg border border-[#2A4070] bg-[#0E1A2F] px-3 py-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button className="rounded-lg bg-teal-300 px-4 py-2 text-sm font-bold text-[#0E1A2F]">Update</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="min-h-screen bg-[#0E1A2F] px-4 py-10 text-[#E8EEF8]">
      <Suspense fallback={<p>Loading...</p>}>
        <Applicants params={params} />
      </Suspense>
    </main>
  );
}