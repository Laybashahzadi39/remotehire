"use client";

import { useActionState } from "react";
import { createJob } from "@/actions/jobs";

export default function JobForm() {
  const [state, formAction, pending] = useActionState(createJob, undefined);

  const input =
    "w-full rounded-lg border border-[#2A4070] bg-[#0E1A2F] px-4 py-3 text-[#E8EEF8] placeholder:text-[#7D8DAA] outline-none focus:border-teal-300";

  return (
    <form action={formAction} className="w-full max-w-2xl space-y-5 rounded-2xl border border-[#22345A] bg-[#142544] p-8">
      <div>
        <h1 className="text-2xl font-bold text-[#E8EEF8]">Post a new job</h1>
        <p className="mt-1 text-sm text-[#A9B8D2]">Your job goes live after admin approval.</p>
      </div>

      <input name="title" placeholder="Job title (e.g. Senior React Developer)" className={input} required />
      <div className="grid gap-5 sm:grid-cols-2">
        <input name="company" placeholder="Company name" className={input} required />
        <input name="location" placeholder="Location (e.g. Remote)" className={input} required />
      </div>
      <input name="salary" placeholder="Salary range (optional)" className={input} />
      <textarea name="description" rows={7} placeholder="Describe the role, requirements and benefits" className={input} required />

      {state?.error && <p className="text-sm text-red-300">{state.error}</p>}

      <button disabled={pending} className="rounded-lg bg-teal-300 px-8 py-3 font-bold text-[#0E1A2F] disabled:opacity-60">
        {pending ? "Posting..." : "Post job"}
      </button>
    </form>
  );
}