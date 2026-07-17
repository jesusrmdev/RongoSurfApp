import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  createSession: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn() },
  hash: vi.fn(),
}));

import { POST } from "@/app/api/register/route";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import type { Mock } from "vitest";

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "Test",
  apellido1: "User",
  apellido2: "Example",
  email: "test@example.com",
  password: "password123",
  phone: "612345678",
  weight: "75",
  height: "178",
  wetsuitSize: "L",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/register", () => {
  it("returns 400 if required fields are missing", async () => {
    const res = await POST(createRequest({ name: "alone" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Todos los campos son obligatorios" });
  });

  it("returns 400 if phone does not have 9 digits", async () => {
    const res = await POST(createRequest({ ...validBody, phone: "12345" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Teléfono no válido (debe tener 9 dígitos)" });
  });

  it("returns 400 if password is too short", async () => {
    const res = await POST(createRequest({ ...validBody, password: "1234567" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "La contraseña debe tener al menos 8 caracteres" });
  });

  it("returns 400 if email format is invalid", async () => {
    const res = await POST(createRequest({ ...validBody, email: "not-an-email" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Email no válido" });
  });

  it("returns 409 if email already exists", async () => {
    vi.mocked(prisma.user.findUnique as Mock).mockResolvedValue({ id: "existing" });
    const res = await POST(createRequest(validBody));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Este email ya está registrado" });
  });

  it("creates user and session on success", async () => {
    vi.mocked(prisma.user.findUnique as Mock).mockResolvedValue(null);
    vi.mocked(prisma.user.create as Mock).mockResolvedValue({
      id: "user-1",
      name: "Test",
      email: "test@example.com",
      role: "USER",
    });
    (bcrypt.hash as Mock).mockResolvedValue("hashed-password");

    const res = await POST(createRequest(validBody));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("user-1");
    expect(body.name).toBe("Test");

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: "Test",
        apellido1: "User",
        apellido2: "Example",
        email: "test@example.com",
        password: "hashed-password",
        phone: "612345678",
        weight: 75,
        height: 178,
        wetsuitSize: "L",
      },
    });
    expect(createSession).toHaveBeenCalledWith("user-1", "USER");
  });
});
