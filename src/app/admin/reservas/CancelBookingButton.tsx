"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelBookingButton({
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
      await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      router.refresh();
    } catch {
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
    >
      {loading ? "..." : "Cancelar"}
    </button>
  );
}
