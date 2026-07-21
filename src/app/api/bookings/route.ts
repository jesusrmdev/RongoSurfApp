import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const bookings = await prisma.booking.findMany({
      where: { userId: session.userId },
      include: {
        session: {
          include: { class: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener reservas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const { sessionId, weight, height, wetsuitSize } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID es obligatorio" },
        { status: 400 }
      );
    }

    const classSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { class: true },
    });

    if (!classSession || !classSession.isActive) {
      return NextResponse.json(
        { error: "Sesión no disponible" },
        { status: 404 }
      );
    }

    const isRental = classSession.class.type === "RENTAL";

      const [booking] = await prisma.$transaction(async (tx) => {
        const existing = await tx.booking.findFirst({
          where: { userId: session.userId, sessionId, status: "CONFIRMED" },
        });

        if (existing) throw new Error("DUPLICATE_BOOKING");

        if (!isRental) {
          const confirmed = await tx.booking.aggregate({
            where: { sessionId, status: "CONFIRMED" },
            _sum: { participants: true },
          });

          const currentBookings = confirmed._sum.participants || 0;
          if (currentBookings + 1 > classSession.class.capacity) {
            throw new Error("CAPACITY_EXCEEDED");
          }
        }

        const created = await tx.booking.create({
          data: {
            userId: session.userId,
            sessionId,
            participants: 1,
            weight: isRental && weight ? parseInt(weight, 10) || null : null,
            height: isRental && height ? parseInt(height, 10) || null : null,
            wetsuitSize: isRental ? wetsuitSize : null,
          },
          include: {
            session: { include: { class: true } },
          },
        });

        await tx.user.update({
          where: { id: session.userId },
          data: { totalBookings: { increment: 1 } },
        });

        return [created];
      });

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "CAPACITY_EXCEEDED") {
      return NextResponse.json(
        { error: "No quedan plazas disponibles para la sesión seleccionada" },
        { status: 409 }
      );
    }
    if (err instanceof Error && err.message === "DUPLICATE_BOOKING") {
      return NextResponse.json(
        { error: "Ya tienes una reserva en esta sesión" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Error al crear reserva" },
      { status: 500 }
    );
  }
}
