import { prisma } from "@/lib/prisma";

// Ek notification save karta hai (message + jis page par le jana hai)
export async function notify(userId: string, message: string, link: string) {
  await prisma.notification.create({ data: { userId, message, link } });
}