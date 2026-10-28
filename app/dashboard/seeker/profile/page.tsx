import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import ProfileForm from "@/components/ProfileForm";
import ResumeForm from "@/components/ResumeForm";

async function ProfileContent() {
  const session = await requireRole("SEEKER");

  // resumeData (bytes) jaan boojh kar nahi laate, sirf naam
  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
    select: { headline: true, location: true, skills: true, summary: true, resumeName: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My profile</h1>
        <p className="mt-1 text-[#A9B8D2]">Employers see this when you apply to their jobs.</p>
      </div>
      <ProfileForm profile={profile} />
      <ResumeForm userId={session.userId} resumeName={profile?.resumeName ?? null} />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#0E1A2F] px-4 py-10 text-[#E8EEF8]">
      <Suspense fallback={<p>Loading...</p>}>
        <ProfileContent />
      </Suspense>
    </main>
  );
}