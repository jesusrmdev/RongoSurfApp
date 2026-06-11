import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";
import { verifySession } from "./auth";

export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
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
