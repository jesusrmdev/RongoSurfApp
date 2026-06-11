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

    const classItem = await prisma.class.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        capacity: parseInt(body.capacity),
        price: parseFloat(body.price),
        duration: parseInt(body.duration || "90"),
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
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
