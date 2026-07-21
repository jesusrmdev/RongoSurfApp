import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.userId || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};

    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.apellido1 !== undefined) data.apellido1 = String(body.apellido1).trim();
    if (body.apellido2 !== undefined) data.apellido2 = String(body.apellido2).trim();
    if (body.phone !== undefined) {
      const phone = String(body.phone).trim();
      if (!/^\d{9}$/.test(phone)) {
        return NextResponse.json({ error: "Teléfono debe tener 9 dígitos" }, { status: 400 });
      }
      data.phone = phone;
    }
    if (body.weight !== undefined) data.weight = Math.max(0, parseInt(body.weight, 10) || 0);
    if (body.height !== undefined) data.height = Math.max(0, parseInt(body.height, 10) || 0);
    if (body.wetsuitSize !== undefined) data.wetsuitSize = body.wetsuitSize;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        apellido1: true,
        apellido2: true,
        email: true,
        phone: true,
        weight: true,
        height: true,
        wetsuitSize: true,
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.userId || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (existing.role === "ADMIN") {
      return NextResponse.json({ error: "No se puede eliminar un administrador" }, { status: 403 });
    }

    await prisma.booking.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  }
}
