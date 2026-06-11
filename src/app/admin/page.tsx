import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-navy">Panel de Administración</h1>
      <p className="text-muted mt-1">
        Gestiona tus clases y reservas
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/clases"
          className="border border-sand-dark rounded-lg p-6 hover:border-ocean/30 transition-colors"
        >
          <h2 className="font-semibold text-navy">Gestionar Clases</h2>
          <p className="text-sm text-muted mt-1">
            Crear, editar y desactivar clases y sesiones
          </p>
        </Link>

        <Link
          href="/admin/reservas"
          className="border border-sand-dark rounded-lg p-6 hover:border-ocean/30 transition-colors"
        >
          <h2 className="font-semibold text-navy">Ver Reservas</h2>
          <p className="text-sm text-muted mt-1">
            Revisa y gestiona todas las reservas
          </p>
        </Link>
      </div>
    </div>
  );
}
