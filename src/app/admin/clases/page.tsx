import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import Link from "next/link";
import ToggleClassButton from "./ToggleClassButton";
import { formatDuration } from "@/lib/utils";

type ClassWithCount = {
  id: string;
  title: string;
  description: string;
  type: string;
  capacity: number;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt: Date;
  _count: { sessions: number };
};

async function getClasses(): Promise<ClassWithCount[]> {
  return prisma.class.findMany({
    include: {
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminClassesPage() {
  await requireAdmin();
  const classes = await getClasses();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Gestionar Clases</h1>
          <p className="text-muted mt-1">
            {classes.length} clase{classes.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/clases/nueva"
          className="bg-navy text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-navy-light transition-colors"
        >
          Nueva clase
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className={`border rounded-lg p-4 flex items-center justify-between ${
              cls.isActive ? "border-sand-dark" : "border-red-200 bg-red-50/30"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-navy">{cls.title}</h2>
                <span className="text-xs text-muted">
                  {cls.type === "INDIVIDUAL" ? "Individual" : "Grupal"}
                </span>
                {!cls.isActive && (
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                    Inactiva
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5">
                {cls.price}€ · {formatDuration(cls.type, cls.duration)} · Cap. {cls.capacity} ·{" "}
                {cls._count.sessions} sesiones
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ToggleClassButton id={cls.id} isActive={cls.isActive} />
              <Link
                href={`/admin/clases/${cls.id}`}
                className="text-sm text-ocean hover:underline"
              >
                Editar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
