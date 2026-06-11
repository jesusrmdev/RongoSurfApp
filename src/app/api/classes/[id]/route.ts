import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classItem = await prisma.class.findUnique({
      where: { id },
      include: {
        sessions: {
          where: { isActive: true, date: { gte: new Date() } },
          orderBy: { date: "asc" },
        },
      },
    });

    if (!classItem) {
      return NextResponse.json(
        { error: "Clase no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(classItem);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener la clase" },
      { status: 500 }
    );
  }
}
