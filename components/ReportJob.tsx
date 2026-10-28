"use client";

import { useActionState, useState } from "react";
import { reportJob } from "@/actions/reports";

export default function ReportJob({ jobId }: { jobId: string }) {
  const [state, formAction, pending] = useActionState(reportJob, undefined);
  const [open, setOpen] = useState(false);

  const input =
    "w-full rounded-lg border border-[#2A4070] bg-[#0E1A2F] px-3 py-2 text-sm text-[#E8EEF8] outline-none focus:border-teal-300";

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-5 w-full text-center text-sm text-[#7D8DAA] hover:text-red-300">
        Report this job
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-5 space-y-3 border-t border-[#22345A] pt-5">
      <p className="text-sm font-semibold">Report this job</p>
      <input type="hidden" name="jobId" value={jobId} />

      <select name="reason" defaultValue="ASKS_FOR_MONEY" className={input}>
        <option value="ASKS_FOR_MONEY">Asks applicants for money</option>
        <option value="FAKE_COMPANY">Fake company</option>
        <option value="MISLEADING">Misleading information</option>
        <option value="OTHER">Other</option>
      </select>
      <textarea name="details" rows={3} maxLength={300} placeholder="Details (optional)" className={input} />

      {state?.error && <p className="text-sm text-red-300">{state.error}</p>}
      {state?.success && <p className="text-sm text-teal-300">{state.success}</p>}

      <div className="flex gap-3">
        <button disabled={pending} className="rounded-lg bg-red-400/90 px-4 py-2 text-sm font-bold text-[#0E1A2F] disabled:opacity-60">
          {pending ? "Sending..." : "Submit report"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-[#A9B8D2]">Cancel</button>
      </div>
    </form>
  );
}