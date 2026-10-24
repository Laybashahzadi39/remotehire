"use client"; // form mein state use ho rahi hai

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/actions/auth";

export default function SignupPage() {
  // state = server se aaya error, pending = request chal rahi hai
  const [state, formAction, pending] = useActionState(signup, undefined);

  const input =
    "w-full rounded-lg border border-[#2A4070] bg-[#0E1A2F] px-4 py-3 text-[#E8EEF8] placeholder:text-[#7D8DAA] outline-none focus:border-teal-300";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0E1A2F] px-4">
      <form action={formAction} className="w-full max-w-md space-y-5 rounded-2xl border border-[#22345A] bg-[#142544] p-8">
        <div>
          <h1 className="text-2xl font-bold text-[#E8EEF8]">Create your account</h1>
          <p className="mt-1 text-sm text-[#A9B8D2]">Join RemoteHire in less than a minute.</p>
        </div>

        <input name="name" placeholder="Full name" className={input} required />
        <input name="email" type="email" placeholder="Email address" className={input} required />
        <input name="password" type="password" placeholder="Password (min 8 characters)" className={input} required />

        <div className="grid grid-cols-2 gap-3 text-sm text-[#E8EEF8]">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#2A4070] p-3">
            <input type="radio" name="role" value="SEEKER" defaultChecked /> I'm looking for a job
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#2A4070] p-3">
            <input type="radio" name="role" value="EMPLOYER" /> I'm hiring
          </label>
        </div>

        {state?.error && <p className="text-sm text-red-300">{state.error}</p>}

        <button
          disabled={pending}
          className="w-full rounded-lg bg-teal-300 py-3 font-bold text-[#0E1A2F] disabled:opacity-60"
        >
          {pending ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-center text-sm text-[#A9B8D2]">
          Already have an account? <Link href="/login" className="text-teal-300">Log in</Link>
        </p>
      </form>
    </main>
  );
}