import { Suspense } from "react";
import { VerifyForm } from "@/components/EmailForms";

type Props = { searchParams: Promise<{ token?: string }> };

async function Content({ searchParams }: Props) {
  const { token } = await searchParams;
  return <VerifyForm token={token ?? ""} />;
}

export default function VerifyPage({ searchParams }: Props) {
  return (
    <main className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-bg px-4 text-fg">
      <Suspense fallback={<p>Loading...</p>}>
        <Content searchParams={searchParams} />
      </Suspense>
    </main>
  );
}