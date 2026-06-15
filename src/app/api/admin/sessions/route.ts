import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const body = await request.json();

    if (!body.classId || !body.date || !body.time) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(body.date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Fecha no válida" },
        { status: 400 }
      );
    }

    const newSession = await prisma.session.create({
      data: {
        classId: body.classId,
        date: parsedDate,
        time: body.time,
      },
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear sesión" },
      { status: 500 }
    );
  }
}
