"use client";

import { useActionState } from "react";
import { sendContact } from "@/actions/contact";

const input =
  "w-full rounded-full border border-line bg-bg px-5 py-3 text-fg outline-none placeholder:text-faint focus:border-accent";

export default function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, undefined);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <input name="name" placeholder="Your name" aria-label="Your name" className={input} required />
      <input name="email" type="email" placeholder="Your email" aria-label="Your email" className={input} required />
      <textarea
        name="message"
        rows={6}
        placeholder="How can we help?"
        aria-label="Message"
        className="w-full rounded-3xl border border-line bg-bg px-5 py-4 text-fg outline-none placeholder:text-faint focus:border-accent"
        required
      />
      {/* Honeypot: insaan ko nazar nahi aata */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {state?.error && <p className="text-sm text-red-300">{state.error}</p>}
      {state?.success && <p className="text-sm text-accent-ink">{state.success}</p>}

      <button disabled={pending} className="rounded-full bg-accent px-8 py-3 font-extrabold text-on-accent disabled:opacity-60">
        {pending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}