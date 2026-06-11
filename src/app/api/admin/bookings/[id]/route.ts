import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

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
