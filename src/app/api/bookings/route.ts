import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await verifySession();
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
    const session = await verifySession();
    const { sessionId, participants } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID es obligatorio" },
        { status: 400 }
      );
    }

    const classSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { class: true, bookings: true },
    });

    if (!classSession || !classSession.isActive) {
      return NextResponse.json(
        { error: "Sesión no disponible" },
        { status: 404 }
      );
    }

    const currentBookings = classSession.bookings.reduce(
      (sum: number, b: { status: string; participants: number }) => sum + (b.status === "CONFIRMED" ? b.participants : 0),
      0
    );

    const numParticipants = participants || 1;
    if (currentBookings + numParticipants > classSession.class.capacity) {
      return NextResponse.json(
        { error: "No hay suficiente capacidad disponible" },
        { status: 409 }
      );
    }

    const existing = await prisma.booking.findFirst({
      where: {
        userId: session.userId,
        sessionId,
        status: "CONFIRMED",
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya tienes una reserva en esta sesión" },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId: session.userId,
        sessionId,
        participants: numParticipants,
      },
      include: {
        session: { include: { class: true } },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear reserva" },
      { status: 500 }
    );
  }
}
