import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-navy">404</h1>
        <p className="text-muted mt-2">Página no encontrada</p>
        <Link
          href="/"
          className="inline-block mt-6 bg-ocean text-white px-6 py-2 rounded-md font-medium text-sm hover:brightness-110 transition-all"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}