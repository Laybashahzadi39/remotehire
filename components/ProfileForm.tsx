"use client";

import { useActionState } from "react";
import { saveProfile } from "@/actions/profile";

type Props = {
  profile: { headline: string | null; location: string | null; skills: string | null; summary: string | null } | null;
};

export default function ProfileForm({ profile }: Props) {
  const [state, formAction, pending] = useActionState(saveProfile, undefined);

  const input =
    "w-full rounded-lg border border-[#2A4070] bg-[#0E1A2F] px-4 py-3 text-[#E8EEF8] placeholder:text-[#7D8DAA] outline-none focus:border-teal-300";

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-[#22345A] bg-[#142544] p-6 sm:p-8">
      <h2 className="text-xl font-bold">About you</h2>

      <input name="headline" defaultValue={profile?.headline ?? ""} placeholder="Headline (e.g. Full-stack developer)" className={input} />
      <input name="location" defaultValue={profile?.location ?? ""} placeholder="Location (e.g. Lahore, Pakistan)" className={input} />
      <input name="skills" defaultValue={profile?.skills ?? ""} placeholder="Skills, separated by commas (e.g. React, Node.js, SQL)" className={input} />
      <textarea name="summary" defaultValue={profile?.summary ?? ""} rows={5} placeholder="Short summary of your experience" className={input} />

      {state?.error && <p className="text-sm text-red-300">{state.error}</p>}
      {state?.success && <p className="text-sm text-teal-300">{state.success}</p>}

      <button disabled={pending} className="rounded-lg bg-teal-300 px-8 py-3 font-bold text-[#0E1A2F] disabled:opacity-60">
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}