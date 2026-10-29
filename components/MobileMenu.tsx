"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function MobileMenu({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Menu usi page ke liye khula rehta hai, page badalte hi khud band
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  return (
    <div className="md:hidden">
      <button
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpenPath(open ? null : pathname)}
        className="rounded-full border border-line px-3.5 py-1.5 text-fg"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-line bg-bg p-4 shadow-card">
          <div className="flex flex-col gap-4">{children}</div>
        </div>
      )}
    </div>
  );
}



































// "use client";

// import { useState, type ReactNode } from "react";
// import { usePathname } from "next/navigation";

// export default function MobileMenu({ children }: { children: ReactNode }) {
//   const pathname = usePathname();
//   // Menu usi page ke liye khula rehta hai, page badalte hi khud band
//   const [openPath, setOpenPath] = useState<string | null>(null);
//   const open = openPath === pathname;

//   return (
//     <div className="md:hidden">
//       <button
//         aria-label="Toggle menu"
//         aria-expanded={open}
//         onClick={() => setOpenPath(open ? null : pathname)}
//         className="rounded-lg border border-[#3A5287] px-3 py-2 text-[#E8EEF8]"
//       >
//         {open ? "✕" : "☰"}
//       </button>

//       {open && (
//         <div className="absolute inset-x-0 top-full border-b border-[#22345A] bg-[#0E1A2F] p-4 shadow-xl">
//           <div className="flex flex-col gap-4">{children}</div>
//         </div>
//       )}
//     </div>
//   );
// }