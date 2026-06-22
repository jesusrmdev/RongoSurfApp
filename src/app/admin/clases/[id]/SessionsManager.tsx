"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Session = {
  id: string;
  date: Date;
  time: string;
};

export default function SessionsManager({
  classId,
  sessions,
}: {
  classId: string;
  sessions: Session[];
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, date, time }),
      });
      if (res.ok) {
        setSuccess("✓ Sesión añadida correctamente");
        setDate("");
        setTime("");
        setTimeout(() => router.refresh(), 1500);
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear sesión");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (sessionId: string) => {
    setDeletingId(sessionId);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeletingId(null);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/sessions/${deletingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccess("✓ Sesión eliminada correctamente");
        setTimeout(() => router.refresh(), 1500);
      } else {
        const data = await res.json();
        setError(data.error || "Error al eliminar");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  function formatDate(d: Date) {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-navy mb-4">
        Sesiones disponibles
      </h2>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md mb-4">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md mb-4 font-medium">{success}</p>
      )}

      {sessions.length === 0 && (
        <p className="text-sm text-muted mb-4">
          No hay sesiones creadas para esta clase.
        </p>
      )}

      <div className="space-y-2 mb-4">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between bg-sand/20 px-3 py-2 rounded"
          >
            <span className="text-sm text-navy">
              {formatDate(s.date)} — {s.time}
            </span>
            <button
              onClick={() => handleDelete(s.id)}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30"
        />
        <input
          type="time"
          required
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-28 px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-navy text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-navy-light transition-colors disabled:opacity-50"
        >
          Añadir
        </button>
      </form>

      {deletingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setDeletingId(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-navy font-medium">
              ¿Eliminar esta sesión?
            </p>
            <p className="text-xs text-muted mt-1">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 text-sm text-muted border border-sand-dark rounded-md hover:bg-sand/30"
              >
                Volver
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 text-sm text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                Eliminar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
