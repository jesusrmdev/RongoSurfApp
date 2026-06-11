import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.type !== undefined) data.type = body.type;
    if (body.capacity !== undefined) data.capacity = parseInt(body.capacity);
    if (body.price !== undefined) data.price = parseFloat(body.price);
    if (body.duration !== undefined) data.duration = parseInt(body.duration);
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const classItem = await prisma.class.update({
      where: { id },
      data,
    });

    return NextResponse.json(classItem);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar clase" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.class.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar clase" },
      { status: 500 }
    );
  }
}
