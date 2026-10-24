import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { approveJob, rejectJob } from "@/actions/admin";

async function AdminPanel() {
  await requireRole("ADMIN");

  // Sab queries ek sath chalti hain (tez)
  const [users, liveJobs, applications, pending, allUsers] = await Promise.all([
    prisma.user.count(),
    prisma.job.count({ where: { status: "LIVE" } }),
    prisma.application.count(),
    prisma.job.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { employer: { select: { name: true } } }, // password nahi lete
    }),
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } }),
  ]);

  const stats = [
    { label: "Registered users", value: users },
    { label: "Active jobs", value: liveJobs },
    { label: "Applications", value: applications },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <h1 className="text-3xl font-bold">Admin panel</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-[#22345A] bg-[#142544] p-6">
            <p className="text-sm text-[#A9B8D2]">{s.label}</p>
            <p className="mt-2 text-4xl font-bold text-teal-300">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Approval queue */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Jobs waiting for approval ({pending.length})</h2>
        {pending.length === 0 && <p className="text-[#A9B8D2]">No pending jobs.</p>}
        <div className="space-y-4">
          {pending.map((job) => (
            <div key={job.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#22345A] bg-[#142544] p-5">
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
                  <button className="rounded-lg border border-[#3A5287] px-5 py-2 font-semibold">Reject</button>
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
          <table className="w-full text-left text-sm">
            <thead className="bg-[#142544] text-[#A9B8D2]">
              <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th></tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id} className="border-t border-[#22345A]">
                  <td className="p-4">{u.name}</td>
                  <td className="p-4 text-[#A9B8D2]">{u.email}</td>
                  <td className="p-4">{u.role}</td>
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
    <main className="min-h-screen bg-[#0E1A2F] px-4 py-10 text-[#E8EEF8]">
      <Suspense fallback={<p>Loading...</p>}>
        <AdminPanel />
      </Suspense>
    </main>
  );
}