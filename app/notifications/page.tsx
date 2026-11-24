import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { openNotification, markAllRead } from "@/actions/notifications";
import { formatDate } from "@/lib/format";

async function NotificationList() {
  const session = await getSession();
  if (!session) redirect("/login");

  const items = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
          <p className="mt-1 text-muted">{unread} unread</p>
        </div>
        {unread > 0 && (
          <form action={markAllRead}>
            <button className="rounded-full border border-line px-4 py-2 text-sm font-bold hover:border-accent">
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-12 text-center">
          <p className="text-lg font-semibold">No notifications yet</p>
          <p className="mt-1 text-muted">We will tell you when something changes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <form key={n.id} action={openNotification}>
              <input type="hidden" name="id" value={n.id} />
              <button
                className={`flex w-full items-start gap-3 rounded-2xl border border-line p-4 text-left transition hover:border-accent ${
                  n.readAt ? "bg-surface" : "bg-raised"
                }`}
              >
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.readAt ? "bg-line" : "bg-accent"}`} />
                <span className="min-w-0 flex-1">
                  <span className={`block ${n.readAt ? "text-muted" : "font-bold text-fg"}`}>{n.message}</span>
                  <span className="text-xs text-faint">{formatDate(n.createdAt)}</span>
                </span>
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <main className="min-h-[calc(100vh-68px)] bg-bg px-4 py-10 text-fg">
      <Suspense fallback={<p>Loading...</p>}>
        <NotificationList />
      </Suspense>
    </main>
  );
}