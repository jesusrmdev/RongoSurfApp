import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function checkAdmin() {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  return null;
}

export async function GET() {
  const authError = await checkAdmin();
  if (authError) return authError;
  try {
    const classes = await prisma.class.findMany({
      include: {
        sessions: {
          orderBy: { date: "asc" },
        },
        _count: { select: { sessions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(classes);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener clases" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authError = await checkAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();

    const validTypes = ["GROUP", "INDIVIDUAL", "RENTAL"];
    if (!body.type || !validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: "Tipo de clase no válido" },
        { status: 400 }
      );
    }

    const classItem = await prisma.class.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        capacity: Math.max(0, parseInt(body.capacity, 10) || 0),
        price: Math.max(0, parseFloat(body.price) || 0),
        duration: Math.max(0, parseInt(body.duration || "90", 10) || 90),
      },
    });

    return NextResponse.json(classItem, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear clase" },
      { status: 500 }
    );
  }
}
