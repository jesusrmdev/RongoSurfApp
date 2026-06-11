import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import BookForm from "./BookForm";
import { formatDuration } from "@/lib/utils";
import { getSession } from "@/lib/auth";

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

async function getClass(id: string): Promise<ClassData | null> {
  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      sessions: {
        where: { isActive: true, date: { gte: new Date() } },
        orderBy: { date: "asc" },
      },
    },
  });
  return cls as ClassData | null;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(date));
}

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cls = await getClass(id);

  if (!cls) notFound();

  const session = await getSession();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-navy">{cls.title}</h1>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              cls.type === "INDIVIDUAL"
                ? "bg-ocean-light text-ocean"
                : cls.type === "RENTAL"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-sand/50 text-navy"
            }`}
          >
            {cls.type === "INDIVIDUAL"
              ? "Individual"
              : cls.type === "RENTAL"
                ? "Alquiler"
                : "Grupal"}
          </span>
        </div>
        <p className="text-muted mt-2 leading-relaxed">{cls.description}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-muted">
          <span>Duración: {formatDuration(cls.type, cls.duration)}</span>
          <span>Capacidad: {cls.capacity} personas</span>
          <span className="text-lg font-bold text-navy ml-auto">
            {cls.price}€
          </span>
        </div>
      </div>

      {session?.userId ? (
        <BookForm
          classId={cls.id}
          sessions={cls.sessions}
          price={cls.price}
          isRental={cls.type === "RENTAL"}
        />
      ) : (
        <div className="text-center py-8 border border-sand-dark rounded-lg">
          <p className="text-muted">Inicia sesión para reservar</p>
          <Link
            href="/login"
            className="inline-block mt-3 bg-ocean text-white px-6 py-2 rounded-md font-medium text-sm hover:brightness-110 transition-all"
          >
            Iniciar sesión
          </Link>
        </div>
      )}
    </div>
  );
}
