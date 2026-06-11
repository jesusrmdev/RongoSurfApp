"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      window.location.href = "/clases";
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-navy text-center">
          Iniciar sesión
        </h1>
        <p className="text-sm text-muted text-center mt-1">
          Accede a tu cuenta para reservar clases
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-navy mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-navy mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy text-white py-2 rounded-md font-medium text-sm hover:bg-navy-light transition-colors disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-muted">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="text-ocean font-medium hover:underline"
          >
            Registrarse
          </Link>
        </p>

        <div className="mt-4 p-3 bg-sand/30 rounded-md text-xs text-muted">
          <p className="font-medium text-navy mb-1">Demo:</p>
          <p>Admin: admin@surfnaturemurcia.com / admin123</p>
          <p>Usuario: surfer@test.com / surf123</p>
        </div>
      </div>
    </div>
  );
}
