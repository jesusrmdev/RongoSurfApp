import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import CancelBookingButton from "./CancelBookingButton";

type BookingWithRelations = {
  id: string;
  userId: string;
  sessionId: string;
  participants: number;
  weight: number | null;
  height: number | null;
  wetsuitSize: string | null;
  status: string;
  createdAt: Date;
  user: { id: string; name: string; email: string };
  session: {
    id: string;
    classId: string;
    date: Date;
    time: string;
    isActive: boolean;
    class: {
      id: string;
      title: string;
      description: string;
      type: string;
      capacity: number;
      price: number;
      duration: number;
      isActive: boolean;
      createdAt: Date;
    };
  };
};

async function getBookings(): Promise<BookingWithRelations[]> {
  return prisma.booking.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      session: {
        include: { class: true },
      },
    },
    orderBy: { createdAt: "desc" },
  }) as Promise<BookingWithRelations[]>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function AdminBookingsPage() {
  await requireAdmin();
  const bookings = await getBookings();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-navy">Todas las Reservas</h1>
      <p className="text-muted mt-1">
        {bookings.length} reserva{bookings.length > 1 ? "s" : ""}
      </p>

      <div className="mt-6 grid gap-3">
        {bookings.map((b) => (
          <div
            key={b.id}
            className={`border rounded-lg p-4 ${
              b.status === "CANCELLED"
                ? "border-red-200 bg-red-50/30"
                : "border-sand-dark"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-navy text-sm">
                  {b.session.class.title}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {formatDate(b.session.date)} — {b.session.time}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {b.user.name} ({b.user.email}) · {b.participants}{" "}
                  participante{b.participants > 1 ? "s" : ""}
                </p>
                {b.weight && b.height && (
                  <p className="text-xs text-muted mt-0.5">
                    {b.weight}kg · {b.height}cm
                    {b.wetsuitSize && ` · Neopreno: ${b.wetsuitSize}`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    b.status === "CONFIRMED"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {b.status === "CONFIRMED" ? "Confirmada" : "Cancelada"}
                </span>
                {b.status === "CONFIRMED" && (
                  <CancelBookingButton bookingId={b.id} />
                )}
              </div>
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <p className="text-center text-muted py-12">
            No hay reservas todavía.
          </p>
        )}
      </div>
    </div>
  );
}
