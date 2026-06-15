import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import CancelButton from "./CancelButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mis Reservas - Surf Nature Murcia",
  description: "Consulta y gestiona tus reservas de clases de surf.",
};

type BookingData = {
  id: string;
  status: string;
  participants: number;
  weight: number | null;
  height: number | null;
  wetsuitSize: string | null;
  session: {
    date: Date;
    time: string;
    class: {
      title: string;
      type: string;
    };
  };
};

async function getBookings(userId: string): Promise<BookingData[]> {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      session: {
        include: { class: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return bookings.map(b => ({
    id: b.id,
    status: b.status,
    participants: b.participants,
    weight: b.weight,
    height: b.height,
    wetsuitSize: b.wetsuitSize,
    session: {
      date: b.session.date,
      time: b.session.time,
      class: { title: b.session.class.title, type: b.session.class.type },
    },
  }));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function MisReservasPage() {
  const session = await verifySession();
  const bookings = await getBookings(session.userId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-navy">Mis Reservas</h1>
      <p className="text-muted mt-1">
        {bookings.length === 0
          ? "No tienes reservas todavía"
          : `${bookings.length} reserva${bookings.length > 1 ? "s" : ""}`}
      </p>

      <div className="mt-6 grid gap-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className={`border rounded-lg p-5 ${
              b.status === "CANCELLED"
                ? "border-red-200 bg-red-50/50"
                : "border-sand-dark"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-navy">
                  {b.session.class.title}
                </h2>
                <p className="text-sm text-muted mt-1">
                  {formatDate(b.session.date)} — {b.session.time}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  1 participante
                </p>
                {(b.weight || b.height || b.wetsuitSize) && (
                  <p className="text-xs text-muted mt-0.5">
                    {b.weight && `${b.weight}kg`}
                    {b.weight && b.height && " · "}
                    {b.height && `${b.height}cm`}
                    {(b.weight || b.height) && b.wetsuitSize && " · "}
                    {b.wetsuitSize && `Neopreno: ${b.wetsuitSize}`}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    b.status === "CONFIRMED"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {b.status === "CONFIRMED" ? "Confirmada" : "Cancelada"}
                </span>
              </div>
            </div>

            {b.status === "CONFIRMED" && (
              <div className="mt-3 pt-3 border-t border-sand/50">
                <CancelButton bookingId={b.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
