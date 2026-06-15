export default function LoadingPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-ocean border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted mt-4 text-sm">Cargando...</p>
      </div>
    </div>
  );
}