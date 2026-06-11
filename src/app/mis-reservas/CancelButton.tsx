"use client";

import { useState } from "react";

export default function CancelButton({
  bookingId,
}: {
  bookingId: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("¿Cancelar esta reserva?")) return;

    setLoading(true);
    try {
      await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
      window.location.reload();
    } catch {
      alert("Error al cancelar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
    >
      {loading ? "Cancelando..." : "Cancelar reserva"}
    </button>
  );
}
