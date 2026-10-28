"use client";

import { useActionState } from "react";
import { createJob, updateJob } from "@/actions/jobs";

type JobData = {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: string;
  jobType: string;
  salary: string | null;
  description: string;
};

export default function JobForm({ job }: { job?: JobData }) {
  const [state, formAction, pending] = useActionState(job ? updateJob : createJob, undefined);

  const input =
    "w-full rounded-lg border border-[#2A4070] bg-[#0E1A2F] px-4 py-3 text-[#E8EEF8] placeholder:text-[#7D8DAA] outline-none focus:border-teal-300";

  return (
    <form action={formAction} className="w-full max-w-2xl space-y-5 rounded-2xl border border-[#22345A] bg-[#142544] p-6 sm:p-8">
      <div>
        <h1 className="text-2xl font-bold text-[#E8EEF8]">{job ? "Edit job" : "Post a new job"}</h1>
        <p className="mt-1 text-sm text-[#A9B8D2]">
          {job ? "Changes are visible to candidates right away." : "New employers are reviewed once. After approval, your jobs go live instantly."}
        </p>
      </div>

      {job && <input type="hidden" name="jobId" value={job.id} />}

      <input name="title" defaultValue={job?.title} placeholder="Job title (e.g. Senior React Developer)" className={input} required />
      <div className="grid gap-5 sm:grid-cols-2">
        <input name="company" defaultValue={job?.company} placeholder="Company name" className={input} required />
        <input name="location" defaultValue={job?.location} placeholder="Location (e.g. Lahore, Pakistan)" className={input} required />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <select name="workMode" defaultValue={job?.workMode ?? "REMOTE"} className={input}>
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ONSITE">On-site</option>
        </select>
        <select name="jobType" defaultValue={job?.jobType ?? "FULL_TIME"} className={input}>
          <option value="FULL_TIME">Full-time</option>
          <option value="PART_TIME">Part-time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERNSHIP">Internship</option>
        </select>
      </div>

      <input name="salary" defaultValue={job?.salary ?? ""} placeholder="Salary range (optional)" className={input} />
      <textarea name="description" defaultValue={job?.description} rows={7} placeholder="Describe the role, requirements and benefits" className={input} required />

      {state?.error && <p className="text-sm text-red-300">{state.error}</p>}

      <button disabled={pending} className="rounded-lg bg-teal-300 px-8 py-3 font-bold text-[#0E1A2F] disabled:opacity-60">
        {pending ? "Saving..." : job ? "Save changes" : "Post job"}
      </button>
    </form>
  );
}