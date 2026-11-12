"use client";

import { useState, type ComponentProps } from "react";

// Normal input jaisa, bas right side mein aankh ka button
export default function PasswordInput(props: ComponentProps<"input">) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={show ? "text" : "password"} className={`${props.className ?? ""} pr-12`} />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-faint hover:text-fg"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {show ? (
            // Aankh kati hui (password dikh raha hai, click par chhupa do)
            <>
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a3 3 0 004.2 4.2" />
              <path d="M9.9 5.1A10.9 10.9 0 0112 5c6.5 0 10 7 10 7a17.7 17.7 0 01-3.2 4.2M6.1 6.1C3.6 7.8 2 12 2 12s3.5 7 10 7a10.5 10.5 0 004.1-.8" />
            </>
          ) : (
            // Normal aankh (click karo to password dikhega)
            <>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}