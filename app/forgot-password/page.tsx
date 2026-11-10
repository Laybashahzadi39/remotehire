import { ForgotForm } from "@/components/EmailForms";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-bg px-4 text-fg">
      <ForgotForm />
    </main>
  );
}