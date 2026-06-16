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
  const [showModal, setShowModal] = useState(false);

  const handleCancel = async () => {
    setShowModal(false);
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
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
      >
        {loading ? "Cancelando..." : success ? success : "Cancelar reserva"}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-navy font-medium">
              ¿Cancelar esta reserva?
            </p>
            <p className="text-xs text-muted mt-1">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-sm text-muted border border-sand-dark rounded-md hover:bg-sand/30"
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                Cancelar reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
