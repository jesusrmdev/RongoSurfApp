import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export const dynamic = "force-dynamic";

type UserWithBookings = {
  id: string;
  name: string;
  apellido1: string;
  apellido2: string;
  email: string;
  phone: string;
  weight: number;
  height: number;
  wetsuitSize: string;
  role: string;
  totalBookings: number;
  createdAt: Date;
};

async function getUsers(): Promise<UserWithBookings[]> {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      apellido1: true,
      apellido2: true,
      email: true,
      phone: true,
      weight: true,
      height: true,
      wetsuitSize: true,
      role: true,
      totalBookings: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminAlumnosPage() {
  await requireAdmin();
  const users = await getUsers();

  const alumnos = users.filter((u) => u.role === "USER");
  const admins = users.filter((u) => u.role === "ADMIN");

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-navy">Alumnos</h1>
      <p className="text-muted mt-1">
        {alumnos.length} alumno{alumnos.length !== 1 ? "s" : ""} registrado{alumnos.length !== 1 ? "s" : ""}
        {admins.length > 0 && ` · ${admins.length} admin${admins.length !== 1 ? "s" : ""}`}
      </p>

      {/* Desktop table */}
      <div className="mt-8 hidden sm:block overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-sand-dark text-muted text-xs uppercase tracking-wider">
              <th className="py-3 pr-4 font-medium">Nombre</th>
              <th className="py-3 pr-4 font-medium">Email</th>
              <th className="py-3 pr-4 font-medium">Teléfono</th>
              <th className="py-3 pr-4 font-medium">Peso</th>
              <th className="py-3 pr-4 font-medium">Altura</th>
              <th className="py-3 pr-4 font-medium">Neopreno</th>
              <th className="py-3 pr-4 font-medium">Reservas</th>
              <th className="py-3 font-medium">Registro</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((u) => (
              <tr key={u.id} className="border-b border-sand-dark/50 hover:bg-sand/10 transition-colors">
                <td className="py-3 pr-4 text-navy font-medium whitespace-nowrap">
                  {u.name} {u.apellido1} {u.apellido2}
                </td>
                <td className="py-3 pr-4 text-muted">{u.email}</td>
                <td className="py-3 pr-4 text-muted">{u.phone}</td>
                <td className="py-3 pr-4 text-muted">{u.weight} kg</td>
                <td className="py-3 pr-4 text-muted">{u.height} cm</td>
                <td className="py-3 pr-4 text-muted">{u.wetsuitSize}</td>
                <td className="py-3 pr-4">
                  <span className="text-xs bg-ocean/10 text-ocean px-2 py-0.5 rounded-full font-medium">
                    {u.totalBookings}
                  </span>
                </td>
                <td className="py-3 text-muted text-xs whitespace-nowrap">
                  {formatDate(u.createdAt)}
                </td>
              </tr>
            ))}
            {alumnos.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted">
                  No hay alumnos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-8 sm:hidden grid gap-3">
        {alumnos.length === 0 ? (
          <p className="text-muted text-center py-8 text-sm">
            No hay alumnos registrados.
          </p>
        ) : (
          alumnos.map((u) => (
            <div key={u.id} className="border border-sand-dark rounded-lg p-4">
              <p className="font-semibold text-navy text-sm">
                {u.name} {u.apellido1} {u.apellido2}
              </p>
              <p className="text-xs text-muted mt-1">{u.email} · {u.phone}</p>
              <p className="text-xs text-muted mt-0.5">
                {u.weight}kg · {u.height}cm · Neopreno: {u.wetsuitSize}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-ocean/10 text-ocean px-2 py-0.5 rounded-full font-medium">
                  {u.totalBookings} reserva{u.totalBookings !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-muted">
                  Desde {formatDate(u.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
