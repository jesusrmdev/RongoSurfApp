"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelButton({
  bookingId,
}: {
  bookingId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("¿Cancelar esta reserva?")) return;

    setLoading(true);
    try {
      await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
      router.refresh();
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
