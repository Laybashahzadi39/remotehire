"use client";

import { useActionState, useState } from "react";
import { uploadResume, deleteResume } from "@/actions/profile";

export default function ResumeForm({ userId, resumeName }: { userId: string; resumeName: string | null }) {
  const [state, formAction, pending] = useActionState(uploadResume, undefined);
  const [sizeError, setSizeError] = useState("");

  return (
    <div className="space-y-5 rounded-2xl border border-[#22345A] bg-[#142544] p-6 sm:p-8">
      <h2 className="text-xl font-bold">Resume</h2>

      {resumeName ? (
        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-[#0E1A2F] p-4">
          <span className="font-semibold">{resumeName}</span>
          <a href={`/api/resume/${userId}`} target="_blank" className="text-sm font-semibold text-teal-300">View</a>
          <form action={deleteResume}>
            <button className="text-sm font-semibold text-red-300">Delete</button>
          </form>
        </div>
      ) : (
        <p className="text-sm text-[#A9B8D2]">No resume uploaded yet. You need one to apply for jobs.</p>
      )}

      <form action={formAction} className="space-y-4">
        <input
          type="file"
          name="resume"
          accept="application/pdf"
          onChange={(e) => {
            // Server se pehle browser mein size check
            const file = e.target.files?.[0];
            setSizeError(file && file.size > 1_000_000 ? "Resume must be smaller than 1 MB" : "");
          }}
          className="block w-full text-sm text-[#A9B8D2] file:mr-4 file:rounded-lg file:border-0 file:bg-[#1C3260] file:px-4 file:py-2 file:font-semibold file:text-[#E8EEF8]"
        />
        <p className="text-xs text-[#7D8DAA]">PDF only, up to 1 MB. Only employers you apply to can view it.</p>

        {(sizeError || state?.error) && <p className="text-sm text-red-300">{sizeError || state?.error}</p>}
        {state?.success && <p className="text-sm text-teal-300">{state.success}</p>}

        <button
          disabled={pending || !!sizeError}
          className="rounded-lg bg-teal-300 px-8 py-3 font-bold text-[#0E1A2F] disabled:opacity-60"
        >
          {pending ? "Uploading..." : resumeName ? "Replace resume" : "Upload resume"}
        </button>
      </form>
    </div>
  );
}