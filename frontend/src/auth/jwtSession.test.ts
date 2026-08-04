import { describe, expect, it } from "vitest";

import { tokenExpiresAt, tokenIsExpired } from "./jwtSession";

function token(payload: object) {
  const encode = (value: object) => btoa(JSON.stringify(value))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${encode({ alg: "none" })}.${encode(payload)}.signature`;
}

describe("JWT session expiry", () => {
  it("reads the expiry time from a JWT", () => {
    expect(tokenExpiresAt(token({ exp: 1_800_000_000 }))).toBe(1_800_000_000_000);
  });

  it("distinguishes active and expired tokens", () => {
    expect(tokenIsExpired(token({ exp: 200 }), 199_000)).toBe(false);
    expect(tokenIsExpired(token({ exp: 200 }), 200_000)).toBe(true);
  });

  it("treats malformed or expiry-free tokens as expired", () => {
    expect(tokenIsExpired("not-a-jwt")).toBe(true);
    expect(tokenIsExpired(token({ role: "ADMIN" }))).toBe(true);
  });
});
