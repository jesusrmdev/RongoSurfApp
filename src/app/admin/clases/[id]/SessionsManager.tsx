"use client";

import { useState } from "react";

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
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, date, time }),
      });
      if (res.ok) {
        setDate("");
        setTime("");
        window.location.reload();
      }
    } catch {
      alert("Error al crear sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm("¿Eliminar esta sesión?")) return;
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (res.ok) window.location.reload();
    } catch {
      alert("Error al eliminar");
    }
  };

  function formatDate(d: Date) {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(d));
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-navy mb-4">
        Sesiones disponibles
      </h2>

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
    </div>
  );
}
