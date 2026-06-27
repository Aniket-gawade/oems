/**
 * Tests for idempotency utilities.
 * Covers F100 (replay handling) and F101 (conflict handling).
 */
import { describe, it, expect } from "vitest";
import {
  generateIdempotencyKey,
  isIdempotencyReplay,
  isIdempotencyConflict,
  isValidIdempotencyKey,
  IDEMPOTENCY_KEY_MIN_LENGTH,
  IDEMPOTENCY_KEY_MAX_LENGTH
} from "@/api/idempotency";

// ─── generateIdempotencyKey (F086) ────────────────────────────────────────────

describe("generateIdempotencyKey", () => {
  it("generates a non-empty string", () => {
    const key = generateIdempotencyKey();
    expect(typeof key).toBe("string");
    expect(key.length).toBeGreaterThan(0);
  });

  it("generates keys that meet the min-length constraint", () => {
    const key = generateIdempotencyKey();
    expect(key.length).toBeGreaterThanOrEqual(IDEMPOTENCY_KEY_MIN_LENGTH);
  });

  it("generates keys that meet the max-length constraint", () => {
    const key = generateIdempotencyKey();
    expect(key.length).toBeLessThanOrEqual(IDEMPOTENCY_KEY_MAX_LENGTH);
  });

  it("generates unique keys on repeated calls", () => {
    const keys = new Set(Array.from({ length: 100 }, () => generateIdempotencyKey()));
    // All 100 keys should be unique (collision would be astronomically unlikely)
    expect(keys.size).toBe(100);
  });
});

// ─── isValidIdempotencyKey ────────────────────────────────────────────────────

describe("isValidIdempotencyKey", () => {
  it("returns true for a key at minimum length", () => {
    expect(isValidIdempotencyKey("abcdefgh")).toBe(true); // 8 chars
  });

  it("returns false for a key shorter than minimum", () => {
    expect(isValidIdempotencyKey("short")).toBe(false); // 5 chars
  });

  it("returns false for a key longer than maximum", () => {
    expect(isValidIdempotencyKey("x".repeat(129))).toBe(false);
  });

  it("returns true for a key at maximum length", () => {
    expect(isValidIdempotencyKey("x".repeat(128))).toBe(true);
  });

  it("returns true for a generated key", () => {
    const key = generateIdempotencyKey();
    expect(isValidIdempotencyKey(key)).toBe(true);
  });
});

// ─── isIdempotencyReplay (F096, F100) ────────────────────────────────────────

describe("isIdempotencyReplay", () => {
  it("returns true when status is 201 and isReplay is true", () => {
    expect(isIdempotencyReplay(201, true)).toBe(true);
  });

  it("returns false when status is 201 but isReplay is false (first submission)", () => {
    expect(isIdempotencyReplay(201, false)).toBe(false);
  });

  it("returns false for non-201 status even with isReplay true", () => {
    expect(isIdempotencyReplay(200, true)).toBe(false);
    expect(isIdempotencyReplay(409, true)).toBe(false);
  });
});

// ─── isIdempotencyConflict (F097, F101) ──────────────────────────────────────

describe("isIdempotencyConflict", () => {
  it("returns true for IDEMPOTENCY_CONFLICT code", () => {
    expect(isIdempotencyConflict("IDEMPOTENCY_CONFLICT")).toBe(true);
  });

  it("returns false for other error codes", () => {
    expect(isIdempotencyConflict("VALIDATION_ERROR")).toBe(false);
    expect(isIdempotencyConflict("RISK_MAX_QTY_EXCEEDED")).toBe(false);
    expect(isIdempotencyConflict("INTERNAL_SERVER_ERROR")).toBe(false);
  });

  it("returns false for null and undefined", () => {
    expect(isIdempotencyConflict(null)).toBe(false);
    expect(isIdempotencyConflict(undefined)).toBe(false);
  });
});
