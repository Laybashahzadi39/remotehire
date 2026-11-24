import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact | RemoteHire" };

export default function ContactPage() {
  return (
    <main className="min-h-[calc(100vh-68px)] bg-bg px-4 py-12 text-fg">
      <div className="mx-auto max-w-xl">
        <h1 className="text-4xl font-extrabold tracking-tight">Contact us</h1>
        <p className="mb-8 mt-2 text-muted">Questions, feedback or a data request? Send us a message.</p>
        <ContactForm />
      </div>
    </main>
  );
}