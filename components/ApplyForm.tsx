import Link from "next/link";
import { applyToJob } from "@/actions/applications";

// Resume nahi to pehle profile; hai to cover note ke sath apply
export default function ApplyForm({ jobId, hasResume }: { jobId: string; hasResume: boolean }) {
  if (!hasResume) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-[#A9B8D2]">Upload your resume to apply for jobs.</p>
        <Link href="/dashboard/seeker/profile" className="block rounded-lg bg-teal-300 py-3 font-bold text-[#0E1A2F]">
          Complete your profile
        </Link>
      </div>
    );
  }

  return (
    <form action={applyToJob} className="space-y-3">
      <input type="hidden" name="jobId" value={jobId} />
      <textarea
        name="coverNote"
        rows={4}
        maxLength={1000}
        placeholder="Cover note (optional)"
        className="w-full rounded-lg border border-[#2A4070] bg-[#0E1A2F] px-4 py-3 text-sm outline-none placeholder:text-[#7D8DAA] focus:border-teal-300"
      />
      <button className="w-full rounded-lg bg-teal-300 py-3 font-bold text-[#0E1A2F]">Apply now</button>
    </form>
  );
}