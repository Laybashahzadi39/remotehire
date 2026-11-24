export const metadata = { title: "Privacy Policy | RemoteHire" };

export default function PrivacyPage() {
  const h2 = "mt-10 text-xl font-extrabold";
  const p = "mt-3 leading-7 text-muted";

  return (
    <main className="bg-bg px-4 py-12 text-fg">
      <article className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-faint">Last updated: November 2026</p>
        <p className={p}>
          RemoteHire is a job board that connects job seekers and employers. This policy explains what
          information we collect, how we use it, and who can see it.
        </p>

        <h2 className={h2}>1. Information we collect</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li>Account details: name, email address and role. Your password is stored only as a secure hash, never as plain text.</li>
          <li>Profile details you add: headline, location, skills and summary.</li>
          <li>Your resume (PDF) and cover notes, when you upload or send them.</li>
          <li>Jobs you post and applications you send, including their status.</li>
          <li>Notifications we create for your account.</li>
          <li>Security data: your IP address is used briefly to limit repeated login attempts and sign-ups.</li>
        </ul>

        <h2 className={h2}>2. How we use it</h2>
        <p className={p}>
          We use your information to run the service: to show jobs, process applications, send account
          emails (such as email confirmation and password reset), keep the platform safe, and review
          reported jobs.
        </p>

        <h2 className={h2}>3. Who can see your information</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li>Employers can see the profile, cover note and resume of people who applied to their jobs. Your email address is shown to the employer only from the Interview stage.</li>
          <li>Resumes are never public. They open only through a protected link for you and for employers you applied to.</li>
          <li>Administrators can view accounts and reports to moderate the platform.</li>
          <li>We do not sell your personal information.</li>
        </ul>

        <h2 className={h2}>4. Cookies and local storage</h2>
        <p className={p}>
          We use one secure session cookie to keep you logged in. We also store your dark or light mode
          choice in your browser. We do not use advertising cookies.
        </p>

        <h2 className={h2}>5. Security</h2>
        <p className={p}>
          We protect accounts with hashed passwords, secure cookies, login attempt limits and access
          checks on the server. No online service is completely risk free, so please use a strong,
          unique password.
        </p>

        <h2 className={h2}>6. Your choices</h2>
        <p className={p}>
          You can edit your profile and resume at any time, and withdraw an application. To request a
          copy of your data or to delete your account, contact us at [your-email].
        </p>

        <h2 className={h2}>7. Changes and contact</h2>
        <p className={p}>
          We may update this policy and will change the date above when we do. Questions? Use the Contact page to reach us.
        </p>
      </article>
    </main>
  );
}