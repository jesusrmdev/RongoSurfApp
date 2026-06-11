"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ToggleClassButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
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
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs px-2 py-1 rounded font-medium transition-colors disabled:opacity-50 ${
        isActive
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-green-50 text-green-600 hover:bg-green-100"
      }`}
    >
      {loading ? "..." : isActive ? "Desactivar" : "Activar"}
    </button>
  );
}
