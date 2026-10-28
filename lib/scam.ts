// Job ke text mein scam ke nishaan dhoondta hai.
// BLOCK  = paison ki demand (post nahi hogi)
// REVIEW = off-platform contact ya shak wali baatein (admin dekhega)
const BLOCK_PATTERNS = [
  /registration fee/i,
  /security deposit/i,
  /processing fee/i,
  /training fee/i,
  /(pay|send|transfer) (us |a |the )?(fee|deposit|money)/i,
];

const REVIEW_PATTERNS = [
  /whats\s?app/i,
  /telegram/i,
  /guaranteed (income|salary|earnings)/i,
  /[\w.+-]+@[\w-]+\.[\w.]+/,        // email address
  /\b\d{10,}\b|\+\d{8,}/,           // phone number
];

export function screenJob(text: string): "BLOCK" | "REVIEW" | "OK" {
  if (BLOCK_PATTERNS.some((p) => p.test(text))) return "BLOCK";
  if (REVIEW_PATTERNS.some((p) => p.test(text))) return "REVIEW";
  return "OK";
}