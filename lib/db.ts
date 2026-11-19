import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Activity, Registration, RegistrationInput } from "@/lib/registration";

type RegistrationRow = {
  id: string;
  fullName: string;
  age: number;
  culturalInterests: string;
  phone: string;
  occupation: string;
  activity: string;
  consent: number;
  createdAt: number;
};

const globalForDb = globalThis as typeof globalThis & { macDb?: DatabaseSync };

function isRow(value: unknown): value is RegistrationRow {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.fullName === "string" &&
    typeof row.age === "number" &&
    typeof row.culturalInterests === "string" &&
    typeof row.phone === "string" &&
    typeof row.occupation === "string" &&
    typeof row.activity === "string" &&
    typeof row.consent === "number" &&
    typeof row.createdAt === "number"
  );
}

function getDb(): DatabaseSync {
  if (!globalForDb.macDb) {
    const dir = path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    const db = new DatabaseSync(path.join(dir, "registrations.sqlite"));
    db.exec(`
      CREATE TABLE IF NOT EXISTS registrations (
        id TEXT PRIMARY KEY,
        fullName TEXT NOT NULL,
        age INTEGER NOT NULL,
        culturalInterests TEXT NOT NULL,
        phone TEXT NOT NULL,
        occupation TEXT NOT NULL,
        activity TEXT NOT NULL,
        consent INTEGER NOT NULL,
        createdAt INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS registrations_created_at ON registrations (createdAt DESC);
      CREATE INDEX IF NOT EXISTS registrations_activity ON registrations (activity);
    `);
    globalForDb.macDb = db;
  }

  return globalForDb.macDb;
}

function toRegistration(row: RegistrationRow): Registration {
  return {
    id: row.id,
    fullName: row.fullName,
    age: row.age,
    culturalInterests: row.culturalInterests,
    phone: row.phone,
    occupation: row.occupation as Registration["occupation"],
    activity: row.activity as Activity,
    consent: true,
    createdAt: row.createdAt,
  };
}

export function insertRegistration(input: RegistrationInput): Registration {
  const record: Registration = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  getDb()
    .prepare(
      `INSERT INTO registrations
        (id, fullName, age, culturalInterests, phone, occupation, activity, consent, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      record.id,
      record.fullName,
      record.age,
      record.culturalInterests,
      record.phone,
      record.occupation,
      record.activity,
      1,
      record.createdAt,
    );

  return record;
}

export function listRegistrations(): Registration[] {
  const rows = getDb()
    .prepare(
      `SELECT id, fullName, age, culturalInterests, phone, occupation, activity, consent, createdAt
       FROM registrations
       ORDER BY createdAt DESC`,
    )
    .all();

  return rows.filter(isRow).map(toRegistration);
}
