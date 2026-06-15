"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelButton({
  bookingId,
}: {
  bookingId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCancel = async () => {
    if (!confirm("¿Cancelar esta reserva?")) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("✓ Cancelada");
        setTimeout(() => router.refresh(), 1500);
      } else {
        setError("Error al cancelar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCancel}
        disabled={loading}
        className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
      >
        {loading ? "Cancelando..." : success ? success : "Cancelar reserva"}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
