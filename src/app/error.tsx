"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-navy">Algo salió mal</h1>
        <p className="text-muted mt-2">
          Ha ocurrido un error inesperado. Inténtalo de nuevo.
        </p>
        <button
          onClick={reset}
          className="mt-6 bg-ocean text-white px-6 py-2 rounded-md font-medium text-sm hover:brightness-110 transition-all"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}