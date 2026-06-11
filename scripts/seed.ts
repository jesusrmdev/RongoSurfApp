import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = bcrypt.hashSync("admin123", 10);
  const userPassword = bcrypt.hashSync("surf123", 10);

  await prisma.user.upsert({
    where: { email: "admin@surfnaturemurcia.com" },
    update: {},
    create: {
      name: "Admin SurfNature",
      email: "admin@surfnaturemurcia.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "surfer@test.com" },
    update: {},
    create: {
      name: "Surfer Test",
      email: "surfer@test.com",
      password: userPassword,
      role: "USER",
    },
  });

  console.log("Users created");

  const tomorrow = new Date(Date.now() + 86400000);
  const dayAfter = new Date(Date.now() + 172800000);
  const in3Days = new Date(Date.now() + 259200000);
  const in5Days = new Date(Date.now() + 432000000);
  const in7Days = new Date(Date.now() + 604800000);
  const in10Days = new Date(Date.now() + 864000000);

  type SessionData = { date: Date; time: string };

  async function seedClass(
    title: string,
    description: string,
    type: string,
    capacity: number,
    price: number,
    duration: number,
    sessions: SessionData[]
  ) {
    const existing = await prisma.class.findFirst({ where: { title } });
    if (existing) {
      console.log(`Already exists: ${title}`);
      return;
    }
    await prisma.class.create({
      data: {
        title,
        description,
        type,
        capacity,
        price,
        duration,
        sessions: {
          create: sessions.map((s) => ({
            date: s.date,
            time: s.time,
          })),
        },
      },
    });
    console.log(`Created: ${title}`);
  }

  await seedClass(
    "Iniciación",
    "Empieza a surfear desde cero de forma sencilla, segura y divertida en Calnegre. Te acompañamos paso a paso hasta que consigas ponerte de pie y coger tus primeras olas con confianza.",
    "GROUP", 4, 40, 90,
    [
      { date: tomorrow, time: "09:00" },
      { date: tomorrow, time: "11:30" },
      { date: dayAfter, time: "09:00" },
      { date: in3Days, time: "10:00" },
    ]
  );

  await seedClass(
    "Perfeccionamiento",
    "Mejora tu técnica y gana confianza en el agua si ya has surfado antes. Te ayudamos a coger mejores olas, corregir postura y avanzar de forma segura en Calnegre.",
    "GROUP", 4, 40, 90,
    [
      { date: tomorrow, time: "10:00" },
      { date: dayAfter, time: "10:00" },
      { date: dayAfter, time: "16:00" },
    ]
  );

  await seedClass(
    "Surf Camp",
    "Vive una experiencia completa de surf durante un fin de semana en Calnegre. Incluye alojamiento, clases de surf, surfskate y yoga para mejorar tu técnica, desconectar y conectar con el mar.",
    "GROUP", 12, 160, 2880,
    [
      { date: in5Days, time: "09:00" },
      { date: in7Days, time: "09:00" },
      { date: in10Days, time: "09:00" },
    ]
  );

  await seedClass(
    "Alquiler de material 1h",
    "Alquila tabla y neopreno para surfear en Calnegre. Te proporcionamos todo el material necesario para que solo te preocupes de disfrutar del mar.",
    "RENTAL", 4, 18, 60,
    [
      { date: tomorrow, time: "09:00" },
      { date: tomorrow, time: "11:00" },
      { date: tomorrow, time: "13:00" },
      { date: dayAfter, time: "09:00" },
      { date: dayAfter, time: "11:00" },
      { date: in3Days, time: "09:00" },
    ]
  );

  await seedClass(
    "Alquiler de material 2h",
    "Alquila tabla y neopreno para surfear en Calnegre. Te proporcionamos todo el material necesario para que solo te preocupes de disfrutar del mar.",
    "RENTAL", 4, 30, 120,
    [
      { date: tomorrow, time: "09:00" },
      { date: tomorrow, time: "12:00" },
      { date: dayAfter, time: "09:00" },
      { date: dayAfter, time: "12:00" },
      { date: in3Days, time: "09:00" },
    ]
  );

  await seedClass(
    "Alquiler de material 3h",
    "Alquila tabla y neopreno para surfear en Calnegre. Te proporcionamos todo el material necesario para que solo te preocupes de disfrutar del mar.",
    "RENTAL", 4, 45, 180,
    [
      { date: tomorrow, time: "09:00" },
      { date: dayAfter, time: "09:00" },
      { date: in3Days, time: "09:00" },
      { date: in5Days, time: "09:00" },
    ]
  );

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
