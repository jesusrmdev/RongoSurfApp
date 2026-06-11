"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ClassItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  capacity: number;
  price: number;
  duration: number;
};

export default function EditClassForm({
  classItem,
}: {
  classItem: ClassItem;
}) {
  const [form, setForm] = useState({
    title: classItem.title,
    description: classItem.description,
    type: classItem.type,
    capacity: String(classItem.capacity),
    price: String(classItem.price),
    duration: String(classItem.duration),
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/classes/${classItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      router.refresh();
    } catch {
      alert("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          onChange={(e) => setForm({ ...form, description: e.target.value })}
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
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm"
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
            className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm"
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
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-navy text-white py-2 rounded-md font-medium text-sm hover:bg-navy-light transition-colors disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
