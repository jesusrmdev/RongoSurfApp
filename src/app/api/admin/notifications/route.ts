import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.userId || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = await prisma.booking.count({
    where: { createdAt: { gte: today }, status: "CONFIRMED" },
  });

  return NextResponse.json({ count });
}
