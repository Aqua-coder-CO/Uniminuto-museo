import { cookies } from "next/headers";
import { listRegistrations } from "@/lib/db";
import { isValidSession, SESSION_COOKIE } from "@/lib/session";

export async function GET() {
  const jar = await cookies();
  if (!isValidSession(jar.get(SESSION_COOKIE)?.value)) {
    return Response.json({ error: "Inicia sesión para ver las inscripciones." }, { status: 401 });
  }

  return Response.json(
    { registrations: listRegistrations() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
