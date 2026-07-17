import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ get: vi.fn(), set: vi.fn(), delete: vi.fn() })),
}));

import { GET, PATCH } from "@/app/api/profile/route";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Mock } from "vitest";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSession).mockResolvedValue({ userId: "user-1", role: "USER" });
});

describe("GET /api/profile", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(undefined);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "No autenticado" });
  });

  it("returns 404 if user not found", async () => {
    vi.mocked(prisma.user.findUnique as Mock).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Usuario no encontrado" });
  });

  it("returns user profile on success", async () => {
    const fakeUser = {
      id: "user-1",
      name: "Test", apellido1: "User", apellido2: "Example",
      email: "test@example.com", phone: "612345678",
      weight: 75, height: 178, wetsuitSize: "L", role: "USER",
    };
    vi.mocked(prisma.user.findUnique as Mock).mockResolvedValue(fakeUser);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Test");
    expect(body.email).toBe("test@example.com");
    expect(body.apellido1).toBe("User");
    expect(body.wetsuitSize).toBe("L");
  });
});

describe("PATCH /api/profile", () => {
  const validBody = {
    name: "Updated",
    apellido1: "Name",
    apellido2: "Example",
    phone: "698765432",
    weight: "80",
    height: "180",
    wetsuitSize: "XL",
  };

  it("returns 401 if not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(undefined);
    const res = await PATCH(new Request("http://localhost:3000/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    }));
    expect(res.status).toBe(401);
  });

  it("returns 400 if required fields are missing", async () => {
    const res = await PATCH(new Request("http://localhost:3000/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "alone" }),
    }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Todos los campos son obligatorios" });
  });

  it("returns 400 if phone is invalid", async () => {
    const res = await PATCH(new Request("http://localhost:3000/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validBody, phone: "bad" }),
    }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Teléfono no válido (debe tener 9 dígitos)" });
  });

  it("updates and returns user on success", async () => {
    const updatedUser = {
      id: "user-1",
      name: "Updated", apellido1: "Name", apellido2: "Example",
      email: "test@example.com", phone: "698765432",
      weight: 80, height: 180, wetsuitSize: "XL", role: "USER",
    };
    vi.mocked(prisma.user.update as Mock).mockResolvedValue(updatedUser);

    const res = await PATCH(new Request("http://localhost:3000/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Updated");
    expect(body.phone).toBe("698765432");
    expect(body.weight).toBe(80);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        name: "Updated",
        apellido1: "Name",
        apellido2: "Example",
        phone: "698765432",
        weight: 80,
        height: 180,
        wetsuitSize: "XL",
      },
      select: expect.objectContaining({ id: true, name: true }),
    });
  });
});
