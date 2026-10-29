"use client";

export default function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next; // poori site ka rang badal gaya
    try {
      localStorage.setItem("theme", next); // yaad rakhne ke liye
    } catch {}
  }

  const icon = "h-[18px] w-[18px]";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between dark and light mode"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-fg hover:border-accent"
    >
      {/* Dark mode mein sun (light par jane ke liye), light mode mein moon */}
      <svg className={`${icon} hidden dark:block`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className={`${icon} block dark:hidden`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}