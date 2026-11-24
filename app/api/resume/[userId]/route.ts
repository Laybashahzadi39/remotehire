import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { audit } from "@/lib/audit";

export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  // 1. Login hona chahiye
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  // 2. Kaun dekh sakta hai: khud seeker, ya wo employer jis ne application receive ki
  let allowed = session.userId === userId;
  if (!allowed && session.role === "EMPLOYER") {
    const application = await prisma.application.findFirst({
      where: { seekerId: userId, job: { employerId: session.userId } },
      select: { id: true },
    });
    allowed = !!application;
  }
  if (!allowed) return new Response("Forbidden", { status: 403 });

  // 3. File
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { resumeData: true },
  });
  if (!profile?.resumeData) return new Response("Not found", { status: 404 });

  // 4. Resume access log: kisi aur ne dekha to record
  if (session.userId !== userId) {
    await audit(session.userId, "RESUME_VIEWED", "USER", userId, session.role);
  }

  return new Response(new Uint8Array(profile.resumeData), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="resume.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}