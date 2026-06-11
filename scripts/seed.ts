import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const db = new Database("dev.db");

db.pragma("journal_mode = WAL");

const adminId = crypto.randomUUID();
const userId = crypto.randomUUID();

const adminPassword = bcrypt.hashSync("admin123", 10);
const userPassword = bcrypt.hashSync("surf123", 10);

db.prepare(
  `INSERT OR IGNORE INTO "User" (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`
).run(adminId, "Admin SurfNature", "admin@surfnaturemurcia.com", adminPassword, "ADMIN");

db.prepare(
  `INSERT OR IGNORE INTO "User" (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`
).run(userId, "Surfer Test", "surfer@test.com", userPassword, "USER");

console.log("Usuarios creados");

const tomorrow = new Date(Date.now() + 86400000);
const dayAfter = new Date(Date.now() + 172800000);
const in3Days = new Date(Date.now() + 259200000);
const in5Days = new Date(Date.now() + 432000000);

const insertClass = db.prepare(
  `INSERT INTO "Class" (id, title, description, type, capacity, price, duration) VALUES (?, ?, ?, ?, ?, ?, ?)`
);

const insertSession = db.prepare(
  `INSERT INTO "Session" (id, "classId", date, time) VALUES (?, ?, ?, ?)`
);

function seedClass(
  title: string,
  description: string,
  type: string,
  capacity: number,
  price: number,
  duration: number,
  sessions: { date: Date; time: string }[]
) {
  const classId = crypto.randomUUID();
  insertClass.run(classId, title, description, type, capacity, price, duration);
  for (const session of sessions) {
    insertSession.run(crypto.randomUUID(), classId, session.date.toISOString(), session.time);
  }
  console.log(`Creada: ${title}`);
}

seedClass(
  "Clase de Surf Iniciación",
  "Perfecta para principiantes. Aprende las bases del surf en las mejores olas de la Manga del Mar Menor. Incluye material completo.",
  "GROUP", 8, 35, 120,
  [
    { date: tomorrow, time: "09:00" },
    { date: tomorrow, time: "11:30" },
    { date: dayAfter, time: "09:00" },
  ]
);

seedClass(
  "Clase Privada de Surf",
  "Clase individual con instructor dedicado. Ideal para perfeccionar técnica o atención 100% personalizada.",
  "INDIVIDUAL", 1, 65, 90,
  [
    { date: tomorrow, time: "10:00" },
    { date: tomorrow, time: "16:00" },
    { date: dayAfter, time: "10:00" },
  ]
);

seedClass(
  "Surf Avanzado",
  "Para surfistas con experiencia que quieren mejorar su nivel. Trabajamos maniobras, lectura de olas y técnica avanzada.",
  "GROUP", 6, 45, 120,
  [
    { date: in3Days, time: "08:00" },
    { date: in3Days, time: "11:00" },
  ]
);

seedClass(
  "Surf Infantil",
  "Clases diseñadas para niños a partir de 6 años. En un entorno seguro y divertido, con monitores especializados.",
  "GROUP", 6, 25, 90,
  [
    { date: dayAfter, time: "16:00" },
    { date: in5Days, time: "16:00" },
  ]
);

db.close();
