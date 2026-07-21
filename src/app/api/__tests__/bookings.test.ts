import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ get: vi.fn(), set: vi.fn(), delete: vi.fn() })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { POST } from "@/app/api/bookings/route";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSession).mockResolvedValue({ userId: "user-1", role: "USER" });

  vi.mocked(prisma.$transaction).mockImplementation((fn: (tx: unknown) => unknown) => {
    return fn({
      booking: {
        findFirst: vi.fn(),
        aggregate: vi.fn(),
        create: vi.fn(),
      },
      user: {
        update: vi.fn(),
      },
    }) as Promise<unknown>;
  });
});

describe("POST /api/bookings", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(undefined);
    const res = await POST(createRequest({ sessionId: "session-1" }));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "No autenticado" });
  });

  it("returns 400 if sessionId is missing", async () => {
    const res = await POST(createRequest({}));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Session ID es obligatorio" });
  });

  it("returns 404 if session does not exist", async () => {
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null);
    const res = await POST(createRequest({ sessionId: "invalid" }));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Sesión no disponible" });
  });

  it("returns 404 if session is inactive", async () => {
    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      id: "session-1",
      isActive: false,
      class: { type: "GROUP", capacity: 8 },
    } as any);
    const res = await POST(createRequest({ sessionId: "session-1" }));
    expect(res.status).toBe(404);
  });

  it("creates booking successfully for GROUP class", async () => {
    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      id: "session-1",
      isActive: true,
      class: { type: "GROUP", capacity: 8 },
    } as any);

    const txBooking = {
      id: "booking-1",
      userId: "user-1",
      sessionId: "session-1",
      participants: 1,
      weight: null,
      height: null,
      wetsuitSize: null,
      session: { class: { title: "Iniciación" } },
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (fn: (tx: any) => unknown) => {
      return fn({
        booking: {
          findFirst: vi.fn().mockResolvedValue(null),
          aggregate: vi.fn().mockResolvedValue({ _sum: { participants: 0 } }),
          create: vi.fn().mockResolvedValue(txBooking),
        },
        user: {
          update: vi.fn().mockResolvedValue({ id: "user-1" }),
        },
      });
    });

    const res = await POST(createRequest({ sessionId: "session-1" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("booking-1");
  });

  it("returns 409 on duplicate booking", async () => {
    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      id: "session-1",
      isActive: true,
      class: { type: "GROUP", capacity: 8 },
    } as any);

    vi.mocked(prisma.$transaction).mockImplementation(async (fn: (tx: any) => unknown) => {
      try {
        return fn({
          booking: {
            findFirst: vi.fn().mockResolvedValue({ id: "existing" }),
            aggregate: vi.fn(),
            create: vi.fn(),
          },
          user: {
            update: vi.fn(),
          },
        });
      } catch (e) {
        throw e;
      }
    });

    const res = await POST(createRequest({ sessionId: "session-1" }));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Ya tienes una reserva en esta sesión" });
  });

  it("returns 409 when capacity exceeded", async () => {
    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      id: "session-1",
      isActive: true,
      class: { type: "GROUP", capacity: 2 },
    } as any);

    vi.mocked(prisma.$transaction).mockImplementation(async (fn: (tx: any) => unknown) => {
      try {
        return fn({
          booking: {
            findFirst: vi.fn().mockResolvedValue(null),
            aggregate: vi.fn().mockResolvedValue({ _sum: { participants: 2 } }),
            create: vi.fn(),
          },
          user: {
            update: vi.fn(),
          },
        });
      } catch (e) {
        throw e;
      }
    });

    const res = await POST(createRequest({ sessionId: "session-1" }));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "No quedan plazas disponibles para la sesión seleccionada" });
  });

  it("creates rental booking with weight/height/wetsuit", async () => {
    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      id: "session-1",
      isActive: true,
      class: { type: "RENTAL", capacity: 4 },
    } as any);

    const txBooking = {
      id: "booking-1",
      userId: "user-1",
      sessionId: "session-1",
      participants: 1,
      weight: 75,
      height: 178,
      wetsuitSize: "L",
      session: { class: { title: "Alquiler" } },
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (fn: (tx: any) => unknown) => {
      return fn({
        booking: {
          findFirst: vi.fn().mockResolvedValue(null),
          aggregate: vi.fn(),
          create: vi.fn().mockResolvedValue(txBooking),
        },
        user: {
          update: vi.fn().mockResolvedValue({ id: "user-1" }),
        },
      });
    });

    const res = await POST(createRequest({
      sessionId: "session-1",
      weight: "75",
      height: "178",
      wetsuitSize: "L",
    }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.weight).toBe(75);
    expect(body.wetsuitSize).toBe("L");
  });
});
