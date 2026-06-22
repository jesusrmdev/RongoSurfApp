import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true, name: true, apellido1: true, apellido2: true, email: true, phone: true,
      weight: true, height: true, wetsuitSize: true, role: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { name, apellido1, apellido2, phone, weight, height, wetsuitSize } = await request.json();

    if (!name || !apellido1 || !apellido2 || !phone || !weight || !height || !wetsuitSize) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (!/^\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Teléfono no válido (debe tener 9 dígitos)" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name,
        apellido1,
        apellido2,
        phone,
        weight: Math.max(0, parseInt(weight, 10)) || 0,
        height: Math.max(0, parseInt(height, 10)) || 0,
        wetsuitSize,
      },
      select: {
        id: true, name: true, apellido1: true, apellido2: true, email: true, phone: true,
        weight: true, height: true, wetsuitSize: true, role: true,
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar perfil" },
      { status: 500 }
    );
  }
}
