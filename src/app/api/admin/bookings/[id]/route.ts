import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const { id } = await params;
    const body = await request.json();

    const validStatuses = ["CONFIRMED", "CANCELLED"];
    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Estado no válido" },
        { status: 400 }
      );
    }

    const existing = await prisma.booking.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: body.status },
    });

    if (existing.status !== "CANCELLED" && body.status === "CANCELLED") {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { totalBookings: { decrement: 1 } },
      });
    }

    return NextResponse.json(booking);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar reserva" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const { id } = await params;

    await prisma.booking.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar reserva" },
      { status: 500 }
    );
  }
}
