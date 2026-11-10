import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-bg px-4 text-fg">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-line bg-surface p-8 text-center">
        <h1 className="text-2xl font-extrabold">Check your email</h1>
        <p className="text-muted">We sent you a confirmation link. Click it to activate your account.</p>
        <Link href="/resend-verification" className="block text-sm font-bold text-accent-ink">Did not get it? Send again</Link>
        <Link href="/login" className="block text-sm font-bold text-accent-ink">Back to log in</Link>
      </div>
    </main>
  );
}