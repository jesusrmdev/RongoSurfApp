import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../auth";

describe("encrypt / decrypt", () => {
  it("encrypts and decrypts a valid payload", async () => {
    const payload = { userId: "user-1", role: "USER", expiresAt: new Date(Date.now() + 86400000) };
    const token = await encrypt(payload);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");

    const decrypted = await decrypt(token);
    expect(decrypted?.userId).toBe("user-1");
    expect(decrypted?.role).toBe("USER");
  });

  it("returns undefined for invalid token", async () => {
    const result = await decrypt("invalid-token");
    expect(result).toBeUndefined();
  });

  it("returns undefined for empty string", async () => {
    const result = await decrypt("");
    expect(result).toBeUndefined();
  });

  it("returns undefined for undefined", async () => {
    const result = await decrypt();
    expect(result).toBeUndefined();
  });

  it("rejects token signed with different secret", async () => {
    const payload = { userId: "user-1", role: "ADMIN", expiresAt: new Date(Date.now() + 86400000) };

    const wrongKey = new TextEncoder().encode("different-secret-that-is-also-long-enough!!");
    const { SignJWT } = await import("jose");
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(wrongKey);

    const result = await decrypt(token);
    expect(result).toBeUndefined();
  });
});
