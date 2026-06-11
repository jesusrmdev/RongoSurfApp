"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Session = {
  id: string;
  date: Date;
  time: string;
};

export default function BookForm({
  classId,
  sessions,
  price,
}: {
  classId: string;
  sessions: Session[];
  price: number;
}) {
  const [selectedSession, setSelectedSession] = useState("");
  const [participants, setParticipants] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    error: boolean;
  } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSession,
          participants,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ text: data.error || "Error al reservar", error: true });
        return;
      }

      setMessage({
        text: "Reserva confirmada! Redirigiendo...",
        error: false,
      });
      setTimeout(() => {
        router.push("/mis-reservas");
        router.refresh();
      }, 1500);
    } catch {
      setMessage({ text: "Error de conexión", error: true });
    } finally {
      setLoading(false);
    }
  };

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date(date));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-navy mb-2">
          Elige una sesión
        </label>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted">
            No hay sesiones disponibles próximamente.
          </p>
        ) : (
          <div className="grid gap-2">
            {sessions.map((s) => (
              <label
                key={s.id}
                className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                  selectedSession === s.id
                    ? "border-ocean bg-ocean-light"
                    : "border-sand-dark hover:border-ocean/30"
                }`}
              >
                <input
                  type="radio"
                  name="session"
                  value={s.id}
                  checked={selectedSession === s.id}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="accent-ocean"
                />
                <div>
                  <p className="text-sm font-medium text-navy">
                    {formatDate(s.date)}
                  </p>
                  <p className="text-xs text-muted">{s.time}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="participants"
          className="block text-sm font-medium text-navy mb-1"
        >
          Número de participantes
        </label>
        <input
          id="participants"
          type="number"
          min={1}
          max={10}
          value={participants}
          onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
          className="w-20 px-3 py-2 border border-sand-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean"
        />
        <p className="text-xs text-muted mt-1">
          Total: {price * participants}€
        </p>
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.error ? "text-red-500" : "text-green-600"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !selectedSession}
        className="w-full bg-navy text-white py-2.5 rounded-md font-medium text-sm hover:bg-navy-light transition-colors disabled:opacity-50"
      >
        {loading ? "Reservando..." : "Confirmar reserva"}
      </button>
    </form>
  );
}
