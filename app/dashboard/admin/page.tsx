import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { approveJob, rejectJob, takeDownJob, dismissReports, blockUser, unblockUser } from "@/actions/admin";

const REASONS: Record<string, string> = {
  ASKS_FOR_MONEY: "Asks for money",
  FAKE_COMPANY: "Fake company",
  MISLEADING: "Misleading",
  OTHER: "Other",
};

const card = "rounded-2xl border border-[#22345A] bg-[#142544]";
const ghost = "rounded-lg border border-[#3A5287] px-4 py-2 text-sm font-semibold hover:border-teal-300";

async function AdminPanel() {
  await requireRole("ADMIN");

  // Sab queries ek sath (tez)
  const [users, liveJobs, applications, openReports, pending, reportedJobs, allUsers] = await Promise.all([
    prisma.user.count(),
    prisma.job.count({ where: { status: "LIVE" } }),
    prisma.application.count(),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.job.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { employer: { select: { name: true } } },
    }),
    // Wo jobs jin par open reports hain
    prisma.job.findMany({
      where: { reports: { some: { status: "OPEN" } } },
      include: {
        employer: { select: { name: true } },
        reports: { where: { status: "OPEN" }, select: { reason: true, details: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true, blocked: true },
    }),
  ]);

  const stats = [
    { label: "Registered users", value: users },
    { label: "Active jobs", value: liveJobs },
    { label: "Applications", value: applications },
    { label: "Open reports", value: openReports },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Admin panel</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`${card} p-5`}>
            <p className="text-sm text-[#A9B8D2]">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-teal-300">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Reports */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Reported jobs ({reportedJobs.length})</h2>
        {reportedJobs.length === 0 && <p className="text-[#A9B8D2]">No open reports.</p>}
        <div className="space-y-4">
          {reportedJobs.map((job) => (
            <div key={job.id} className={`${card} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{job.title}</p>
                  <p className="text-sm text-[#A9B8D2]">
                    {job.company} · Posted by {job.employer.name} · Status: {job.status}
                  </p>
                </div>
                <span className="rounded-full bg-red-400/15 px-3 py-1 text-xs font-semibold text-red-300">
                  {job.reports.length} report(s)
                </span>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-[#C9D5EA]">
                {job.reports.map((r, i) => (
                  <li key={i}>• {REASONS[r.reason]}{r.details ? `: ${r.details}` : ""}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3 border-t border-[#22345A] pt-4">
                <form action={takeDownJob}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <button className="rounded-lg bg-red-400/90 px-4 py-2 text-sm font-bold text-[#0E1A2F]">Take down job</button>
                </form>
                <form action={dismissReports}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <button className={ghost}>Dismiss reports</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Approval queue */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Jobs waiting for approval ({pending.length})</h2>
        {pending.length === 0 && <p className="text-[#A9B8D2]">No pending jobs.</p>}
        <div className="space-y-4">
          {pending.map((job) => (
            <div key={job.id} className={`${card} flex flex-wrap items-center justify-between gap-4 p-5`}>
              <div>
                <p className="text-lg font-semibold">{job.title}</p>
                <p className="text-sm text-[#A9B8D2]">{job.company} · {job.location} · Posted by {job.employer.name}</p>
              </div>
              <div className="flex gap-3">
                <form action={approveJob}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <button className="rounded-lg bg-teal-300 px-5 py-2 font-bold text-[#0E1A2F]">Approve</button>
                </form>
                <form action={rejectJob}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <button className={ghost}>Reject</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Users */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">All users</h2>
        <div className="overflow-x-auto rounded-xl border border-[#22345A]">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-[#142544] text-[#A9B8D2]">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id} className="border-t border-[#22345A]">
                  <td className="p-4">{u.name}</td>
                  <td className="p-4 text-[#A9B8D2]">{u.email}</td>
                  <td className="p-4">{u.role}</td>
                  <td className="p-4">
                    {u.blocked ? (
                      <span className="rounded-full bg-red-400/15 px-3 py-1 text-xs font-semibold text-red-300">Blocked</span>
                    ) : (
                      <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">Active</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== "ADMIN" && (
                      <form action={u.blocked ? unblockUser : blockUser}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button className={ghost}>{u.blocked ? "Unblock" : "Block"}</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function AdminPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#0E1A2F] px-4 py-10 text-[#E8EEF8]">
      <Suspense fallback={<p>Loading...</p>}>
        <AdminPanel />
      </Suspense>
    </main>
  );
}