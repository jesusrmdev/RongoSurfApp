export function formatDuration(type: string, duration: number): string {
  if (type === "RENTAL") {
    if (duration <= 60) return "1h";
    if (duration <= 120) return "2h";
    return "3h";
  }
  if (duration >= 1440) return `${duration / 1440} días`;
  return `${duration} min`;
}
