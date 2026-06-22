"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteBookingButton({
  bookingId,
}: {
  bookingId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setShowModal(false);
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Error al eliminar reserva");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
      >
        {loading ? "..." : "Eliminar"}
      </button>

      {error && <p className="text-xs text-red-500 mt-1 mb-2">{error}</p>}

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
              ¿Eliminar esta reserva?
            </p>
            <p className="text-xs text-muted mt-1">
              Se borrará permanentemente. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-sm text-muted border border-sand-dark rounded-md hover:bg-sand/30"
              >
                Volver
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-sm text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                Eliminar reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
