"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type User = {
  id: string;
  name: string;
  apellido1: string;
  apellido2: string;
  email: string;
  role: string;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newBookings, setNewBookings] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser);
  }, []);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    const check = () =>
      fetch("/api/admin/notifications")
        .then((r) => r.ok ? r.json() : null)
        .then((d) => d && setNewBookings(d.count))
        .catch(() => {});
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [user?.role]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-navy text-white" onClick={(e) => e.stopPropagation()}>
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Surf Nature Murcia"
            width={40}
            height={40}
            className="rounded"
          />
          <span className="text-lg font-semibold tracking-tight">
            Surf Nature Murcia
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/clases" className="hover:text-sand transition-colors">
            Clases
          </Link>
          {user ? (
            <>
              <Link
                href="/perfil"
                className="hover:text-sand transition-colors"
              >
                Mi Perfil
              </Link>
              {user.role !== "ADMIN" && (
                <Link
                  href="/mis-reservas"
                  className="hover:text-sand transition-colors"
                >
                  Mis Reservas
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hover:text-sand transition-colors relative"
                >
                  Admin
                  {newBookings > 0 && (
                    <span className="absolute -top-2 -right-4 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {newBookings}
                    </span>
                  )}
                </Link>
              )}
              <span className="text-sand/60">{user.name} {user.apellido1} {user.apellido2}</span>
              <button
                onClick={handleLogout}
                className="text-sm hover:text-sand transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:text-sand transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="bg-sand text-navy px-3 py-1.5 rounded-md text-sm font-medium hover:bg-sand-dark transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        <button
          className="sm:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      <div
        className={`sm:hidden px-4 flex flex-col gap-3 text-sm overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-64 opacity-100 pb-4" : "max-h-0 opacity-0 pb-0"
        }`}
      >
        <Link href="/clases" onClick={() => setMenuOpen(false)}>
          Clases
        </Link>
        {user ? (
          <>
            <Link href="/perfil" onClick={() => setMenuOpen(false)}>
              Mi Perfil
            </Link>
            {user.role !== "ADMIN" && (
              <Link href="/mis-reservas" onClick={() => setMenuOpen(false)}>
                Mis Reservas
              </Link>
            )}
            {user.role === "ADMIN" && (
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="relative inline-block w-fit">
                Admin
                {newBookings > 0 && (
                  <span className="inline-flex ml-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 items-center justify-center px-1">
                    {newBookings}
                  </span>
                )}
              </Link>
            )}
            <button onClick={handleLogout}>Cerrar sesión</button>
          </>
        ) : (
          <>
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              Iniciar sesión
            </Link>
            <Link href="/register" onClick={() => setMenuOpen(false)}>
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
