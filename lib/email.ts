// Sends an email with Resend. Without an API key (local testing), the link is printed in the terminal.
export async function sendEmail(to: string, subject: string, html: string, devLink?: string) {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    console.log(`\n[DEV EMAIL] To: ${to}\nSubject: ${subject}\nLink: ${devLink}\n`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "RemoteHire <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) console.error("Email failed:", res.status, await res.text());
}