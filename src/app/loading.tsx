export default function LoadingPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-[3px] h-8">
          <span className="w-1.5 bg-ocean rounded-full animate-[wave_1.2s_ease-in-out_infinite]" />
          <span className="w-1.5 bg-ocean rounded-full animate-[wave_1.2s_ease-in-out_infinite_0.2s]" />
          <span className="w-1.5 bg-ocean rounded-full animate-[wave_1.2s_ease-in-out_infinite_0.4s]" />
          <span className="w-1.5 bg-ocean rounded-full animate-[wave_1.2s_ease-in-out_infinite_0.2s]" />
          <span className="w-1.5 bg-ocean rounded-full animate-[wave_1.2s_ease-in-out_infinite]" />
        </div>
        <p className="text-muted mt-6 text-sm">Cargando...</p>
      </div>
    </div>
  );
}