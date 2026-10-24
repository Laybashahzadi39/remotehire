"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  const input =
    "w-full rounded-lg border border-[#2A4070] bg-[#0E1A2F] px-4 py-3 text-[#E8EEF8] placeholder:text-[#7D8DAA] outline-none focus:border-teal-300";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0E1A2F] px-4">
      <form action={formAction} className="w-full max-w-md space-y-5 rounded-2xl border border-[#22345A] bg-[#142544] p-8">
        <div>
          <h1 className="text-2xl font-bold text-[#E8EEF8]">Welcome back</h1>
          <p className="mt-1 text-sm text-[#A9B8D2]">Log in to continue to RemoteHire.</p>
        </div>

        <input name="email" type="email" placeholder="Email address" className={input} required />
        <input name="password" type="password" placeholder="Password" className={input} required />

        {state?.error && <p className="text-sm text-red-300">{state.error}</p>}

        <button disabled={pending} className="w-full rounded-lg bg-teal-300 py-3 font-bold text-[#0E1A2F] disabled:opacity-60">
          {pending ? "Logging in..." : "Log in"}
        </button>

        <p className="text-center text-sm text-[#A9B8D2]">
          New here? <Link href="/signup" className="text-teal-300">Create an account</Link>
        </p>
      </form>
    </main>
  );
}