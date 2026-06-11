import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { notFound } from "next/navigation";
import EditClassForm from "./EditClassForm";
import SessionsManager from "./SessionsManager";

type SessionData = {
  id: string;
  date: Date;
  time: string;
};

type ClassWithSessions = {
  id: string;
  title: string;
  description: string;
  type: string;
  capacity: number;
  price: number;
  duration: number;
  isActive: boolean;
  sessions: SessionData[];
};

async function getClass(id: string): Promise<ClassWithSessions | null> {
  return prisma.class.findUnique({
    where: { id },
    include: {
      sessions: {
        where: { isActive: true },
        orderBy: { date: "asc" },
      },
    },
  }) as Promise<ClassWithSessions | null>;
}

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const cls = await getClass(id);

  if (!cls) notFound();

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-navy">Editar Clase</h1>

      <div className="mt-6">
        <EditClassForm classItem={cls} />
      </div>

      <div className="mt-8 pt-8 border-t border-sand-dark">
        <SessionsManager classId={cls.id} sessions={cls.sessions} />
      </div>
    </div>
  );
}
