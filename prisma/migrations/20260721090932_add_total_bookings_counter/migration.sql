-- AlterTable
ALTER TABLE "User" ADD COLUMN     "totalBookings" INTEGER NOT NULL DEFAULT 0;

-- Backfill: contar todas las reservas existentes (todos los estados) por usuario
UPDATE "User"
SET "totalBookings" = sub.cnt
FROM (
  SELECT "userId", COUNT(*)::int AS cnt
  FROM "Booking"
  GROUP BY "userId"
) sub
WHERE "User".id = sub."userId";
