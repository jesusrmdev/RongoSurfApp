import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const body = await request.json();

    const session = await prisma.session.create({
      data: {
        classId: body.classId,
        date: new Date(body.date),
        time: body.time,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear sesión" },
      { status: 500 }
    );
  }
}
