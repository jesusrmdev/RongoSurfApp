import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import CancelButton from "./CancelButton";

type BookingData = {
  id: string;
  status: string;
  participants: number;
  session: {
    date: Date;
    time: string;
    class: {
      title: string;
    };
  };
};

async function getBookings(userId: string): Promise<BookingData[]> {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      session: {
        include: { class: true },
      },
    },
    orderBy: { createdAt: "desc" },
  }) as Promise<BookingData[]>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default async function MisReservasPage() {
  const session = await verifySession();
  if (!session) redirect("/login");

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
                  {b.participants} participante{b.participants > 1 ? "s" : ""}
                </p>
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
