"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserData = {
  id: string;
  name: string;
  apellido1: string;
  apellido2: string;
  phone: string;
  weight: number;
  height: number;
  wetsuitSize: string;
};

const WETSUIT_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

export default function EditUserModal({ user, onClose }: { user: UserData; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    apellido1: user.apellido1,
    apellido2: user.apellido2,
    phone: user.phone,
    weight: String(user.weight),
    height: String(user.height),
    wetsuitSize: user.wetsuitSize,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess(true);
        router.refresh();
        setTimeout(onClose, 1000);
      } else {
        const data = await res.json();
        setError(data.error || "Error al actualizar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md mx-4 w-full shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-navy mb-4">Editar alumno</h2>

        {success && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4">
            Alumno actualizado correctamente
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-muted mb-1">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-sand-dark rounded-md px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-ocean"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Apellido 1</label>
            <input
              name="apellido1"
              value={form.apellido1}
              onChange={handleChange}
              required
              className="w-full border border-sand-dark rounded-md px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-ocean"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Apellido 2</label>
            <input
              name="apellido2"
              value={form.apellido2}
              onChange={handleChange}
              required
              className="w-full border border-sand-dark rounded-md px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-ocean"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Teléfono</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              pattern="\d{9}"
              title="9 dígitos"
              className="w-full border border-sand-dark rounded-md px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-ocean"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Peso (kg)</label>
              <input
                name="weight"
                type="number"
                min="0"
                value={form.weight}
                onChange={handleChange}
                required
                className="w-full border border-sand-dark rounded-md px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-ocean"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Altura (cm)</label>
              <input
                name="height"
                type="number"
                min="0"
                value={form.height}
                onChange={handleChange}
                required
                className="w-full border border-sand-dark rounded-md px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-ocean"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Neopreno</label>
            <select
              name="wetsuitSize"
              value={form.wetsuitSize}
              onChange={handleChange}
              required
              className="w-full border border-sand-dark rounded-md px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-ocean"
            >
              <option value="">Seleccionar</option>
              {WETSUIT_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 text-sm text-muted border border-sand-dark rounded-md hover:bg-sand/30 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-3 py-1.5 text-sm text-white bg-ocean rounded-md hover:bg-ocean-dark disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
