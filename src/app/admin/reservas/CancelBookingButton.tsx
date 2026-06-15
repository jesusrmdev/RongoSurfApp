"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelBookingButton({
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
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        setSuccess("✓ Cancelada");
        setTimeout(() => router.refresh(), 1500);
      } else setError("Error al cancelar");
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
        {loading ? "..." : success ? success : "Cancelar"}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
