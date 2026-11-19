import { cookies } from "next/headers";
import { passwordsMatch, createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

export async function POST(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !process.env.SESSION_SECRET) {
    return Response.json(
      { error: "El acceso del museo no está configurado." },
      { status: 500 },
    );
  }

  let password = "";
  try {
    const body: unknown = await request.json();
    if (typeof body === "object" && body !== null && "password" in body && typeof body.password === "string") {
      password = body.password;
    }
  } catch {
    password = "";
  }

  if (!password || !passwordsMatch(password, expected)) {
    return Response.json({ error: "La contraseña no coincide." }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
