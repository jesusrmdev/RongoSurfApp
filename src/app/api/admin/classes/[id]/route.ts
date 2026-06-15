import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function checkAdmin() {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  return null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await checkAdmin();
  if (authError) return authError;
  try {
    const { id } = await params;
    const body = await request.json();

    const validTypes = ["GROUP", "INDIVIDUAL", "RENTAL"];
    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.type !== undefined) {
      if (!validTypes.includes(body.type)) {
        return NextResponse.json(
          { error: "Tipo de clase no válido" },
          { status: 400 }
        );
      }
      data.type = body.type;
    }
    if (body.capacity !== undefined) data.capacity = parseInt(body.capacity, 10) || 0;
    if (body.price !== undefined) data.price = parseFloat(body.price) || 0;
    if (body.duration !== undefined) data.duration = parseInt(body.duration, 10) || 0;
    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { error: "isActive debe ser un booleano" },
          { status: 400 }
        );
      }
      data.isActive = body.isActive;
    }

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
  const authError = await checkAdmin();
  if (authError) return authError;
  try {
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
