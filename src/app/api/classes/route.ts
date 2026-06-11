import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      where: { isActive: true },
      include: {
        sessions: {
          where: { isActive: true, date: { gte: new Date() } },
          orderBy: { date: "asc" },
        },
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
