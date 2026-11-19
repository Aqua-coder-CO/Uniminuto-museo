import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminDesk } from "@/components/AdminDesk";
import { MuseumChrome } from "@/components/MuseumChrome";
import { listRegistrations } from "@/lib/db";
import { isValidSession, SESSION_COOKIE } from "@/lib/session";

export const metadata: Metadata = {
  title: "Inscripciones · Equipo MAC",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <MuseumChrome>
          <p className="text-ink/70">Abriendo el listado…</p>
        </MuseumChrome>
      }
    >
      <AdminGate />
    </Suspense>
  );
}

async function AdminGate() {
  const jar = await cookies();
  const allowed = isValidSession(jar.get(SESSION_COOKIE)?.value);

  return (
    <AdminDesk
      initialLocked={!allowed}
      initialRegistrations={allowed ? listRegistrations() : []}
    />
  );
}
