export default function Footer() {
  return (
    <footer className="bg-navy text-white/60 text-sm py-8 mt-auto">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="font-semibold text-white/80">SurfNatureMurcia</p>
        <p className="mt-1">Escuela de Surf · Calnegre, Murcia</p>
        <p className="mt-4 text-xs">
          &copy; {new Date().getFullYear()} SurfNatureMurcia. Todos los
          derechos reservados.
        </p>
      </div>
    </footer>
  );
}
