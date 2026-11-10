import { prisma } from "@/lib/prisma";
import { newToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";

const appUrl = () => process.env.APP_URL ?? "http://localhost:3000";

// Creates a token (old ones of the same type stop working)
async function createToken(userId: string, type: "VERIFY_EMAIL" | "RESET_PASSWORD", hours: number) {
  await prisma.emailToken.deleteMany({ where: { userId, type } });
  const { token, hash } = newToken();
  await prisma.emailToken.create({
    data: { userId, type, tokenHash: hash, expiresAt: new Date(Date.now() + hours * 3_600_000) },
  });
  return token;
}

export async function sendVerification(userId: string, email: string) {
  const link = `${appUrl()}/verify?token=${await createToken(userId, "VERIFY_EMAIL", 24)}`;
  await sendEmail(
    email,
    "Confirm your email for RemoteHire",
    `<p>Welcome to RemoteHire.</p><p><a href="${link}">Confirm my email</a></p><p>This link expires in 24 hours.</p>`,
    link
  );
}

export async function sendPasswordReset(userId: string, email: string) {
  const link = `${appUrl()}/reset-password?token=${await createToken(userId, "RESET_PASSWORD", 1)}`;
  await sendEmail(
    email,
    "Reset your RemoteHire password",
    `<p>We received a request to reset your password.</p><p><a href="${link}">Choose a new password</a></p><p>This link expires in 1 hour. If you did not ask for it, ignore this email.</p>`,
    link
  );
}