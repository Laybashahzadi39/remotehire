export const metadata = { title: "Terms of Service | RemoteHire" };

export default function TermsPage() {
  const h2 = "mt-10 text-xl font-extrabold";
  const p = "mt-3 leading-7 text-muted";

  return (
    <main className="bg-bg px-4 py-12 text-fg">
      <article className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-faint">Last updated: November 2026</p>
        <p className={p}>
          By creating an account or using RemoteHire, you agree to these terms. If you do not agree,
          please do not use the service.
        </p>

        <h2 className={h2}>1. Your account</h2>
        <p className={p}>
          Give accurate information, keep your password private, and do not share your account. You are
          responsible for activity on your account.
        </p>

        <h2 className={h2}>2. Job seekers</h2>
        <p className={p}>
          Apply only with truthful information. Do not send spam or misleading applications.
        </p>

        <h2 className={h2}>3. Employers</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li>Employers must never charge applicants any fee, deposit or payment.</li>
          <li>Job posts must be real, accurate and lawful.</li>
          <li>Do not use job posts to collect contact details or move candidates to other platforms.</li>
          <li>Applicant information may be used only for hiring decisions for the job they applied to.</li>
        </ul>

        <h2 className={h2}>4. Moderation</h2>
        <p className={p}>
          New jobs may be reviewed before they appear. We may hide, remove or expire jobs, and suspend
          accounts that break these terms or are reported as fraudulent.
        </p>

        <h2 className={h2}>5. Prohibited use</h2>
        <p className={p}>
          Do not scrape the site, attack or disrupt the service, upload harmful files, or try to access
          data that belongs to other users.
        </p>

        <h2 className={h2}>6. No employment guarantee</h2>
        <p className={p}>
          RemoteHire connects job seekers and employers. We do not guarantee any job, interview or hire,
          and we are not a party to any employment agreement.
        </p>

        <h2 className={h2}>7. Liability</h2>
        <p className={p}>
          The service is provided “as is”. To the extent allowed by law, RemoteHire is not liable for
          losses that result from using the platform or from dealings between users.
        </p>

        <h2 className={h2}>8. Changes and contact</h2>
        <p className={p}>
          We may update these terms and will change the date above when we do. Contact us at
          [your-email].
        </p>
      </article>
    </main>
  );
}