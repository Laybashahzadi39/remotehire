import { Suspense } from "react";
import JobForm from "@/components/JobForm";
import { requireRole } from "@/lib/auth";

// Cookie parhne wala hissa Suspense ke andar (Cache Components ka rule)
async function Guard() {
  await requireRole("EMPLOYER");
  return <JobForm />;
}

export default function NewJobPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0E1A2F] px-4 py-10">
      <Suspense fallback={<p className="text-[#E8EEF8]">Loading...</p>}>
        <Guard />
      </Suspense>
    </main>
  );
}