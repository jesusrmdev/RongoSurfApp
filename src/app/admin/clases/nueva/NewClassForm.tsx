"use client";

import { useState } from "react";

export default function NewClassForm() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "GROUP",
    capacity: "8",
    price: "35",
    duration: "90",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al crear clase");
        return;
      }

      const cls = await res.json();
      window.location.href = `/admin/clases/${cls.id}`;
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-navy">Nueva Clase</h1>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md mt-4">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Título
          </label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Descripción
          </label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">
              Tipo
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean"
            >
              <option value="GROUP">Grupal</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="RENTAL">Alquiler</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">
              Capacidad
            </label>
            <input
              type="number"
              required
              value={form.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: e.target.value })
              }
              className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">
              Precio (€)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">
              Duración (min)
            </label>
            <input
              type="number"
              required
              value={form.duration}
              onChange={(e) =>
                setForm({ ...form, duration: e.target.value })
              }
              className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-navy text-white py-2 rounded-md font-medium text-sm hover:bg-navy-light transition-colors disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear clase"}
        </button>
      </form>
    </div>
  );
}
