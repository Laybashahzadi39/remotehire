import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

async function AuditLog() {
  await requireRole("ADMIN");

  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const actorIds = [...new Set(logs.map((l) => l.actorId))];
  const actors = await prisma.user.findMany({
    where: { id: { in: actorIds } },
    select: { id: true, name: true, role: true },
  });
  const actorName = (id: string) => actors.find((a) => a.id === id)?.name ?? "Unknown";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Audit log</h1>
      <p className="mb-8 mt-1 text-muted">Last {logs.length} actions. Who did what, and when.</p>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="p-4">Time</th>
              <th className="p-4">Who</th>
              <th className="p-4">Action</th>
              <th className="p-4">Target</th>
              <th className="p-4">Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted">No actions recorded yet.</td></tr>
            )}
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-line">
                <td className="p-4 text-faint">{l.createdAt.toLocaleString("en-US")}</td>
                <td className="p-4">{actorName(l.actorId)}</td>
                <td className="p-4 font-bold">{l.action}</td>
                <td className="p-4 text-muted">{l.targetType}</td>
                <td className="p-4 text-muted">{l.detail ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AuditPage() {
  return (
    <main className="min-h-[calc(100vh-68px)] bg-bg px-4 py-10 text-fg">
      <Suspense fallback={<p>Loading...</p>}>
        <AuditLog />
      </Suspense>
    </main>
  );
}