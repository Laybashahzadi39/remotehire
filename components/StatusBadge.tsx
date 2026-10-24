// Har status ka apna rang (ek jagah define, har page mein use)
const STYLES: Record<string, string> = {
  PENDING: "bg-amber-400/15 text-amber-300",
  REVIEWED: "bg-sky-400/15 text-sky-300",
  INTERVIEW: "bg-teal-400/15 text-teal-300",
  REJECTED: "bg-red-400/15 text-red-300",
  LIVE: "bg-emerald-400/15 text-emerald-300",
  CLOSED: "bg-slate-400/15 text-slate-300",
};

export default function StatusBadge({ status }: { status: string }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase(); // "INTERVIEW" -> "Interview"
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status] ?? ""}`}>
      {label}
    </span>
  );
}