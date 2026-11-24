import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "RemoteHire | Remote Job Board",
  description: "Find remote and on-site jobs, apply in one click and track every application.",
};

// Hamesha DARK se shuru. Light tab hi jab visitor khud toggle dabaye.
const themeScript = `(function(){try{var t=localStorage.getItem("rh-theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={manrope.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-bg text-fg antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}