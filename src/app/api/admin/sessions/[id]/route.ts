import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const { id } = await params;

    const activeBookings = await prisma.booking.count({
      where: { sessionId: id, status: "CONFIRMED" },
    });

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: hay ${activeBookings} reserva(s) activa(s)` },
        { status: 409 }
      );
    }

    await prisma.session.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar sesión" },
      { status: 500 }
    );
  }
}
