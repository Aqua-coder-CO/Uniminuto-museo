import { insertRegistration } from "@/lib/db";
import { parseRegistration } from "@/lib/registration";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "No pudimos leer la inscripción." },
      { status: 400 },
    );
  }

  const parsed = parseRegistration(body);
  if (!parsed.ok) {
    return Response.json({ errors: parsed.errors }, { status: 400 });
  }

  const saved = insertRegistration(parsed.data);
  return Response.json(
    { id: saved.id, activity: saved.activity },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
