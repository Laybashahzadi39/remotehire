"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Click: notification "read" karo aur us ke page par bhej do
export async function openNotification(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const id = String(formData.get("id"));
  // Sirf apni notification (ownership check)
  const n = await prisma.notification.findFirst({ where: { id, userId: session.userId } });
  if (!n) redirect("/notifications");

  await prisma.notification.update({ where: { id: n.id }, data: { readAt: new Date() } });
  redirect(n.link);
}

export async function markAllRead() {
  const session = await getSession();
  if (!session) redirect("/login");

  await prisma.notification.updateMany({
    where: { userId: session.userId, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
}