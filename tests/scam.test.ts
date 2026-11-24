import { describe, it, expect } from "vitest";
import { screenJob } from "@/lib/scam";

describe("screenJob (scam screening)", () => {
  it("blocks jobs that ask for a registration fee", () => {
    expect(screenJob("Pay a registration fee of 5000 to start working")).toBe("BLOCK");
  });

  it("blocks jobs that ask for a security deposit", () => {
    expect(screenJob("A refundable security deposit is required")).toBe("BLOCK");
  });

  it("sends WhatsApp contact to review", () => {
    expect(screenJob("Great remote role, contact us on WhatsApp to apply")).toBe("REVIEW");
  });

  it("sends email addresses to review", () => {
    expect(screenJob("Send your CV to hiring@example.com today")).toBe("REVIEW");
  });

  it("sends phone numbers to review", () => {
    expect(screenJob("Call 03001234567 for details")).toBe("REVIEW");
  });

  it("allows a normal job description", () => {
    expect(screenJob("We need a developer to build and maintain web apps for our team")).toBe("OK");
  });
});