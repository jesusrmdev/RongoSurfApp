import { prisma } from "@/lib/prisma";
import Link from "next/link";

type SessionData = {
  id: string;
  date: Date;
  time: string;
};

type ClassData = {
  id: string;
  title: string;
  description: string;
  type: string;
  capacity: number;
  price: number;
  duration: number;
  sessions: SessionData[];
};

async function getClasses(): Promise<ClassData[]> {
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
  return classes as ClassData[];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export default async function ClasesPage() {
  const classes = await getClasses();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-navy">Clases disponibles</h1>
      <p className="text-muted mt-1">
        Elige tu clase y reserva tu plaza
      </p>

      <div className="mt-8 grid gap-6">
        {classes.length === 0 && (
          <p className="text-muted text-center py-12">
            No hay clases disponibles en este momento.
          </p>
        )}

        {classes.map((cls) => (
          <div
            key={cls.id}
            className="border border-sand-dark rounded-lg p-6 hover:border-ocean/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-navy">
                    {cls.title}
                  </h2>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      cls.type === "INDIVIDUAL"
                        ? "bg-ocean-light text-ocean"
                        : "bg-sand/50 text-navy"
                    }`}
                  >
                    {cls.type === "INDIVIDUAL" ? "Individual" : "Grupal"}
                  </span>
                </div>
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  {cls.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                  <span>{cls.duration} min</span>
                  <span>Capacidad: {cls.capacity}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-navy">{cls.price}€</p>
                <Link
                  href={`/clases/${cls.id}`}
                  className="inline-block mt-2 bg-navy text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-navy-light transition-colors"
                >
                  Reservar
                </Link>
              </div>
            </div>

            {cls.sessions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-sand/50">
                <p className="text-xs text-muted mb-2">Próximas sesiones:</p>
                <div className="flex flex-wrap gap-2">
                  {cls.sessions.map((s) => (
                    <span
                      key={s.id}
                      className="text-xs bg-sand/30 px-2.5 py-1 rounded"
                    >
                      {formatDate(s.date)} — {s.time}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
