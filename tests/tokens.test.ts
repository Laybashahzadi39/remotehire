import { describe, it, expect } from "vitest";
import { newToken, hashToken } from "@/lib/tokens";

describe("email tokens", () => {
  it("creates a token and its hash", () => {
    const { token, hash } = newToken();
    expect(token).toHaveLength(64);
    expect(hash).toHaveLength(64);
    expect(hash).not.toBe(token); // database mein sirf hash jata hai
  });

  it("hashes the same token to the same value", () => {
    const { token, hash } = newToken();
    expect(hashToken(token)).toBe(hash);
  });

  it("creates a different token every time", () => {
    expect(newToken().token).not.toBe(newToken().token);
  });
});