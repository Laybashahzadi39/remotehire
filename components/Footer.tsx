import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line px-4 py-8 text-sm text-faint">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <span>© RemoteHire. All rights reserved.</span>
        <nav className="flex gap-6">
          <Link href="/contact" className="hover:text-fg">Contact</Link>
          <Link href="/privacy" className="hover:text-fg">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-fg">Terms of Service</Link>
        </nav>
      </div>
    </footer>
  );
}