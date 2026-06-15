"use client";

import { useState } from "react";

export default function CancelBookingButton({
  bookingId,
}: {
  bookingId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    if (!confirm("¿Cancelar esta reserva?")) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) window.location.reload();
      else setError("Error al cancelar");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCancel}
        disabled={loading}
        className="text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
      >
        {loading ? "..." : "Cancelar"}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
