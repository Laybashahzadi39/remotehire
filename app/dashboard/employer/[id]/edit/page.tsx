import { Suspense } from "react";
import { notFound } from "next/navigation";
import JobForm from "@/components/JobForm";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

async function EditGuard({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("EMPLOYER");
  const { id } = await params;

  // Job meri apni honi chahiye
  const job = await prisma.job.findFirst({ where: { id, employerId: session.userId } });
  if (!job) notFound();

  return (
    <JobForm
      job={{
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        workMode: job.workMode,
        jobType: job.jobType,
        salary: job.salary,
        description: job.description,
      }}
    />
  );
}

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#0E1A2F] px-4 py-10">
      <Suspense fallback={<p className="text-[#E8EEF8]">Loading...</p>}>
        <EditGuard params={params} />
      </Suspense>
    </main>
  );
}