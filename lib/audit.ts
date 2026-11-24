import { prisma } from "@/lib/prisma";

// Ek record: kisne (actorId) kya (action) kis par (targetType + targetId) kiya
export async function audit(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  detail?: string
) {
  await prisma.auditLog.create({ data: { actorId, action, targetType, targetId, detail: detail ?? null } });
}