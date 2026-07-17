import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

import { PATCH } from "@/app/api/bookings/[id]/route";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Mock } from "vitest";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSession).mockResolvedValue({ userId: "user-1", role: "USER" });
});

const patch = (id: string) =>
  PATCH(
    new Request(`http://localhost:3000/api/bookings/${id}`, { method: "PATCH" }),
    { params: Promise.resolve({ id }) }
  );

describe("PATCH /api/bookings/[id]", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(undefined);
    const res = await patch("booking-1");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "No autenticado" });
  });

  it("returns 404 if booking not found", async () => {
    vi.mocked(prisma.booking.findUnique as Mock).mockResolvedValue(null);
    const res = await patch("booking-1");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Reserva no encontrada" });
  });

  it("returns 403 if booking belongs to another user", async () => {
    vi.mocked(prisma.booking.findUnique as Mock).mockResolvedValue({
      id: "booking-1",
      userId: "other-user",
    });
    const res = await patch("booking-1");
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "No autorizado" });
  });

  it("cancels booking on success", async () => {
    vi.mocked(prisma.booking.findUnique as Mock).mockResolvedValue({
      id: "booking-1",
      userId: "user-1",
    });
    vi.mocked(prisma.booking.update as Mock).mockResolvedValue({});

    const res = await patch("booking-1");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: "booking-1" },
      data: { status: "CANCELLED" },
    });
  });
});
