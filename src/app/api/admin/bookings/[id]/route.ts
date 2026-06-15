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

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: body.status },
    });

    return NextResponse.json(booking);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar reserva" },
      { status: 500 }
    );
  }
}
