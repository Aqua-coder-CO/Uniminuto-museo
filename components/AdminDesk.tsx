"use client";

import { useMemo, useState } from "react";
import { MuseumChrome, PrimaryButton, QuietButton } from "@/components/MuseumChrome";
import { activityTitle, occupationLabel, type Activity, type Registration } from "@/lib/registration";

type Filter = "todas" | Activity;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "sensorial", label: "Obra sensorial" },
  { value: "huella", label: "Deja tu huella" },
];

export function AdminDesk({
  initialLocked,
  initialRegistrations,
}: {
  initialLocked: boolean;
  initialRegistrations: Registration[];
}) {
  const [status, setStatus] = useState<"locked" | "ready">(initialLocked ? "locked" : "ready");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [entering, setEntering] = useState(false);
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [filter, setFilter] = useState<Filter>("todas");
  const [loadError, setLoadError] = useState("");

  async function load() {
    const response = await fetch("/api/admin/registrations", { cache: "no-store" });
    if (response.status === 401) {
      setStatus("locked");
      return;
    }
    if (!response.ok) {
      setLoadError("No pudimos cargar las inscripciones.");
      setStatus("ready");
      return;
    }
    const body: unknown = await response.json();
    const rows =
      body && typeof body === "object" && "registrations" in body && Array.isArray(body.registrations)
        ? body.registrations.filter(isRegistration)
        : [];
    setRegistrations(rows);
    setStatus("ready");
  }

  async function login() {
    setEntering(true);
    setLoginError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const message =
          body && typeof body === "object" && "error" in body && typeof body.error === "string"
            ? body.error
            : "La contraseña no coincide.";
        setLoginError(message);
        return;
      }
      setPassword("");
      await load();
    } catch {
      setLoginError("No pudimos comprobar la contraseña.");
    } finally {
      setEntering(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setRegistrations([]);
    setStatus("locked");
  }

  const visible = useMemo(
    () => registrations.filter((item) => filter === "todas" || item.activity === filter),
    [registrations, filter],
  );

  if (status === "locked") {
    return (
      <MuseumChrome
        actions={
          <PrimaryButton onClick={login} disabled={entering}>
            {entering ? "Comprobando…" : "Entrar"}
          </PrimaryButton>
        }
      >
        <div className="max-w-md">
          <p className="text-sm font-medium tracking-[0.18em] text-clay-deep uppercase">Equipo del museo</p>
          <h1 className="mt-3 font-serif text-5xl text-ink">Inscripciones</h1>
          <p className="mt-4 text-ink/75">Esta lista es solo para el equipo del MAC.</p>
          <label htmlFor="password" className="mt-8 block font-medium text-ink">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void login();
            }}
            className="mt-2 w-full rounded-2xl border border-line bg-card px-4 py-3 text-lg outline-none focus:border-ink"
          />
          {loginError ? <p className="mt-3 text-sm text-clay-deep">{loginError}</p> : null}
        </div>
      </MuseumChrome>
    );
  }

  return (
    <MuseumChrome
      actions={<QuietButton onClick={logout}>Cerrar sesión</QuietButton>}
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-medium tracking-[0.18em] text-clay-deep uppercase">Equipo del museo</p>
          <h1 className="mt-3 font-serif text-5xl text-ink">Inscripciones</h1>
          <p className="mt-3 text-ink/70">
            {registrations.length === 0
              ? "Todavía no hay inscripciones."
              : `${registrations.length} ${registrations.length === 1 ? "inscripción" : "inscripciones"}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por actividad">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`h-11 rounded-full px-4 text-sm ${
                filter === item.value ? "bg-ink text-paper" : "border border-line bg-card text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {loadError ? <p className="text-sm text-clay-deep">{loadError}</p> : null}
        {visible.length === 0 ? (
          <p className="rounded-3xl border border-line bg-card px-5 py-8 text-ink/70">
            No hay inscripciones en esta actividad.
          </p>
        ) : (
          <ul className="grid gap-3">
            {visible.map((item) => (
              <li key={item.id} className="rounded-3xl border border-line bg-card px-5 py-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h2 className="font-serif text-2xl text-ink">{item.fullName}</h2>
                  <p className="text-sm text-ink/55">{formatWhen(item.createdAt)}</p>
                </div>
                <p className="mt-2 text-moss">{activityTitle(item.activity)}</p>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <Info label="Edad" value={String(item.age)} />
                  <Info label="Teléfono" value={item.phone} />
                  <Info label="Ocupación" value={occupationLabel(item.occupation)} />
                  <Info label="Gustos" value={item.culturalInterests} />
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MuseumChrome>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink/50">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function formatWhen(timestamp: number): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

function isRegistration(value: unknown): value is Registration {
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
    row.consent === true &&
    typeof row.createdAt === "number"
  );
}
