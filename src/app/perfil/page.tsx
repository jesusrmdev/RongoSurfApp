"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [wetsuitSize, setWetsuitSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((user) => {
        setName(user.name);
        setEmail(user.email);
        setPhone(user.phone);
        setWeight(String(user.weight));
        setHeight(String(user.height));
        setWetsuitSize(user.wetsuitSize);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, weight, height, wetsuitSize }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ text: data.error, error: true });
        return;
      }

      setMessage({ text: "Perfil actualizado correctamente", error: false });
      router.refresh();
    } catch {
      setMessage({ text: "Error de conexión", error: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-muted">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-navy text-center">
          Mi Perfil
        </h1>
        <p className="text-sm text-muted text-center mt-1">
          Tus datos personales
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-navy mb-1">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm bg-gray-50 text-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted mt-1">No se puede cambiar el email</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-navy mb-1">
              Teléfono móvil
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean"
            />
          </div>

          <div className="pt-2 border-t border-sand/50">
            <p className="text-xs font-medium text-muted mb-3">
              Datos para el material
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-navy mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy mb-1">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-navy mb-1">
                Talla de neopreno
              </label>
              <select
                required
                value={wetsuitSize}
                onChange={(e) => setWetsuitSize(e.target.value)}
                className="w-full px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30"
              >
                <option value="">Seleccionar</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
          </div>

          {message && (
            <p className={`text-sm text-center ${message.error ? "text-red-500" : "text-green-600"}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-navy text-white py-2 rounded-md font-medium text-sm hover:bg-navy-light transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
