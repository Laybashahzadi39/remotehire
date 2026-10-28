import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  // 1. Login hona chahiye
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  // 2. Kaun dekh sakta hai: khud seeker...
  let allowed = session.userId === userId;

  // ...ya wo employer jis ki job par is seeker ne apply kiya
  if (!allowed && session.role === "EMPLOYER") {
    const application = await prisma.application.findFirst({
      where: { seekerId: userId, job: { employerId: session.userId } },
      select: { id: true },
    });
    allowed = !!application;
  }
  if (!allowed) return new Response("Forbidden", { status: 403 });

  // 3. File bhejo
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { resumeData: true },
  });
  if (!profile?.resumeData) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(profile.resumeData), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="resume.pdf"',
      "Cache-Control": "private, no-store", // kisi cache mein save na ho
    },
  });
}