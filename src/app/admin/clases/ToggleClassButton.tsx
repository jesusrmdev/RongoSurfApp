"use client";

import { useState } from "react";

export default function ToggleClassButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleToggle = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        const msg = isActive ? "✓ Desactivada" : "✓ Activada";
        setSuccess(msg);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError("Error al cambiar estado");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={loading || !!success}
        className={`text-xs px-2 py-1 rounded font-medium transition-colors disabled:opacity-50 ${
          isActive
            ? "bg-red-50 text-red-500 hover:bg-red-100"
            : "bg-green-50 text-green-600 hover:bg-green-100"
        }`}
      >
        {loading ? "..." : success ? success : isActive ? "Desactivar" : "Activar"}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}