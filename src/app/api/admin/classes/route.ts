import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export async function GET() {
  try {
    await requireAdmin();
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
  try {
    await requireAdmin();
    const body = await request.json();

    const classItem = await prisma.class.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        capacity: parseInt(body.capacity),
        price: parseFloat(body.price),
        duration: parseInt(body.duration || "90"),
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
