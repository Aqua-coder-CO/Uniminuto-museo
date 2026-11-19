import Link from "next/link";
import type { ReactNode } from "react";

const STEPS = ["Bienvenida", "Registro", "Actividad", "Confirmación"] as const;

export function MuseumChrome({
  children,
  step,
  actions,
}: {
  children: ReactNode;
  step?: number;
  actions?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 pt-6 pb-8 sm:px-8">
      <header className="flex flex-col gap-6 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <Link href="/" className="block">
          <p className="text-xs font-medium tracking-[0.22em] text-moss uppercase">
            Museo de Arte Contemporáneo
          </p>
          <p className="font-serif text-3xl leading-none text-ink">UNIMINUTO</p>
        </Link>
        {typeof step === "number" ? <StepMeter step={step} /> : null}
      </header>
      <main className="py-8 sm:py-10">{children}</main>
      {actions ? <div className="pb-10">{actions}</div> : null}
      <footer className="mt-auto flex flex-col gap-3 border-t border-line pt-5 text-sm text-ink/75 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p>Carrera 74 No. 82A-81, Bogotá</p>
          <p>
            <a className="underline decoration-line underline-offset-4 hover:text-ink" href="tel:2916520">
              291 6520 ext. 6160
            </a>
            {" · "}
            <a
              className="underline decoration-line underline-offset-4 hover:text-ink"
              href="mailto:mac.bogota@uniminuto.edu"
            >
              mac.bogota@uniminuto.edu
            </a>
          </p>
        </div>
        <Link href="/admin" className="text-moss underline decoration-line underline-offset-4 hover:text-ink">
          Acceso del equipo
        </Link>
      </footer>
    </div>
  );
}

function StepMeter({ step }: { step: number }) {
  const current = Math.min(step, STEPS.length - 1);

  return (
    <ol className="grid grid-cols-4 gap-2 sm:w-80">
      {STEPS.map((label, index) => {
        const active = index === current;
        const done = index < current;
        return (
          <li key={label} aria-current={active ? "step" : undefined}>
            <p className={`font-serif text-lg leading-none ${active ? "text-clay-deep" : done ? "text-ink" : "text-ink/35"}`}>
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className={`mt-1 hidden text-xs sm:block ${active ? "text-ink" : "text-ink/50"}`}>{label}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function PrimaryButton({
  children,
  type = "button",
  disabled,
  onClick,
}: {
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-14 min-w-44 items-center justify-center rounded-full bg-ink px-7 text-base font-medium text-paper transition hover:bg-clay-deep disabled:cursor-wait disabled:opacity-70"
    >
      {children}
    </button>
  );
}

export function QuietButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex h-14 items-center justify-center rounded-full border border-ink/15 bg-card px-6 text-base text-ink transition hover:border-ink"
    >
      {children}
    </button>
  );
}
