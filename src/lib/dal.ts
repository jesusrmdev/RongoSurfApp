import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";
import { verifySession, getSession } from "./auth";

export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, phone: true, weight: true, height: true, wetsuitSize: true, role: true },
  });

  return user;
});

export const requireAdmin = cache(async () => {
  const session = await verifySession();
  if (session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
});

export async function requireAuthApi() {
  const session = await getSession();
  if (!session?.userId) {
    return { error: "No autenticado", status: 401 as const };
  }
  return { userId: session.userId, role: session.role };
}

export async function requireAdminApi() {
  const session = await getSession();
  if (!session?.userId) {
    return { error: "No autenticado", status: 401 as const };
  }
  if (session.role !== "ADMIN") {
    return { error: "No autorizado", status: 403 as const };
  }
  return { userId: session.userId, role: session.role };
}
