"use client";

import { useActionState, type ReactNode } from "react";
import Link from "next/link";
import { requestReset, resendVerification, verifyEmail, resetPassword } from "@/actions/email";
import PasswordInput from "@/components/PasswordInput";




const input =
  "w-full rounded-full border border-line bg-bg px-5 py-3 text-fg outline-none placeholder:text-faint focus:border-accent";
const button = "w-full rounded-full bg-accent py-3 font-extrabold text-on-accent disabled:opacity-60";

function Card({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="w-full max-w-md space-y-5 rounded-2xl border border-line bg-surface p-8">
      <div>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="mt-1 text-sm text-muted">{text}</p>
      </div>
      {children}
    </div>
  );
}

function Message({ error, success }: { error?: string; success?: string }) {
  return (
    <>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {success && <p className="text-sm text-accent-ink">{success}</p>}
    </>
  );
}

const backLink = (
  <Link href="/login" className="block text-center text-sm font-bold text-accent-ink">Back to log in</Link>
);

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestReset, undefined);
  return (
    <Card title="Forgot your password?" text="Enter your email and we will send you a reset link.">
      <form action={action} className="space-y-4">
        <input name="email" type="email" placeholder="Email address" className={input} required />
        <Message error={state?.error} success={state?.success} />
        <button disabled={pending} className={button}>{pending ? "Sending..." : "Send reset link"}</button>
      </form>
      {backLink}
    </Card>
  );
}

export function ResendForm() {
  const [state, action, pending] = useActionState(resendVerification, undefined);
  return (
    <Card title="Resend verification email" text="Enter your email and we will send a new confirmation link.">
      <form action={action} className="space-y-4">
        <input name="email" type="email" placeholder="Email address" className={input} required />
        <Message error={state?.error} success={state?.success} />
        {/* <PasswordInput name="password" placeholder="New password" className={input} required />   ..... cnfrm it becz ye replac ni hoi add hoi
        <PasswordInput name="confirm" placeholder="Confirm new password" className={input} required /> */}
        <button disabled={pending} className={button}>{pending ? "Sending..." : "Send new link"}</button>
      </form>
      {backLink}
    </Card>
  );
}

export function VerifyForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(verifyEmail, undefined);
  return (
    <Card title="Confirm your email" text="Click the button to confirm your email address.">
      <form action={action} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <Message error={state?.error} success={state?.success} />
        {!state?.success && (
          <button disabled={pending} className={button}>{pending ? "Confirming..." : "Confirm my email"}</button>
        )}
      </form>
      {backLink}
    </Card>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  return (
    <Card title="Choose a new password" text="Use at least 8 characters.">
      <form action={action} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <input name="password" type="password" placeholder="New password" className={input} required />
        <input name="confirm" type="password" placeholder="Confirm new password" className={input} required />
        <Message error={state?.error} success={state?.success} />
        {!state?.success && (
          <button disabled={pending} className={button}>{pending ? "Saving..." : "Save new password"}</button>
        )}
      </form>
      {backLink}
    </Card>
  );
}