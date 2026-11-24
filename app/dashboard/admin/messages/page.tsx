import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

async function Messages() {
  await requireRole("ADMIN");
  const items = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 50 });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Contact messages</h1>
      <p className="mb-8 mt-1 text-muted">{items.length} message(s)</p>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-12 text-center text-muted">
          No messages yet.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((m) => (
            <div key={m.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-bold">{m.name}</p>
                <p className="text-xs text-faint">{m.createdAt.toLocaleString("en-US")}</p>
              </div>
              <a href={`mailto:${m.email}`} className="text-sm font-bold text-accent-ink">{m.email}</a>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <main className="min-h-[calc(100vh-68px)] bg-bg px-4 py-10 text-fg">
      <Suspense fallback={<p>Loading...</p>}>
        <Messages />
      </Suspense>
    </main>
  );
}