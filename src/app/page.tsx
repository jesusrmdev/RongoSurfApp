import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col">
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-navy tracking-tight">
            SurfNatureMurcia
          </h1>
          <p className="mt-4 text-lg text-muted leading-relaxed">
            Escuela de surf en la Manga del Mar Menor. Clases para todos los
            niveles, material incluido, instructores titulados.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/clases"
              className="bg-navy text-white px-6 py-3 rounded-md font-medium hover:bg-navy-light transition-colors"
            >
              Ver clases disponibles
            </Link>
            <Link
              href="/register"
              className="border border-navy/20 text-navy px-6 py-3 rounded-md font-medium hover:bg-sand/50 transition-colors"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-sand/50">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-navy">4+</p>
            <p className="text-sm text-muted mt-1">Tipos de clases</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-navy">Material</p>
            <p className="text-sm text-muted mt-1">Incluido siempre</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-navy">Todos</p>
            <p className="text-sm text-muted mt-1">Los niveles</p>
          </div>
        </div>
      </section>
    </div>
  );
}
