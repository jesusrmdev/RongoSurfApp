import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export async function POST(request: Request) {
  try {
    await requireAdmin();
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
