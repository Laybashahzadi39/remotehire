import { ResendForm } from "@/components/EmailForms";

export default function ResendVerificationPage() {
  return (
    <main className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-bg px-4 text-fg">
      <ResendForm />
    </main>
  );
}