"use client";

import { cloneElement, isValidElement, useState, type ReactElement, type ReactNode } from "react";
import Image from "next/image";
import { MuseumChrome, PrimaryButton, QuietButton } from "@/components/MuseumChrome";
import {
  ACTIVITIES,
  OCCUPATIONS,
  activityLabel,
  draftToInput,
  emptyDraft,
  occupationLabel,
  validateDraft,
  type Activity,
  type FieldErrors,
  type RegistrationDraft,
} from "@/lib/registration";

const DETAIL_FIELDS = ["fullName", "age", "culturalInterests", "phone", "occupation", "consent"] as const;

export function RegistrationWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<RegistrationDraft>(emptyDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function update<K extends keyof RegistrationDraft>(key: K, value: RegistrationDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function goToDetails() {
    const nextErrors = validateDraft(draft);
    const visible = Object.fromEntries(
      DETAIL_FIELDS.filter((field) => nextErrors[field]).map((field) => [field, nextErrors[field]]),
    );
    if (Object.keys(visible).length > 0) {
      setErrors(visible);
      return;
    }
    setErrors({});
    setStep(2);
  }

  function goToReview() {
    if (!draft.activity) {
      setErrors({ activity: "Elige una actividad. Solo puedes escoger una." });
      return;
    }
    setErrors({});
    setStep(3);
  }

  async function submit() {
    const payload = draftToInput(draft);
    const nextErrors = validateDraft(draft);
    if (!payload) {
      setErrors(nextErrors);
      if (DETAIL_FIELDS.some((field) => nextErrors[field])) setStep(1);
      else if (nextErrors.activity) setStep(2);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        if (body && typeof body === "object" && "errors" in body) {
          setErrors(body.errors as FieldErrors);
        }
        setSubmitError("No pudimos guardar la inscripción. Revisa los datos e inténtalo de nuevo.");
        return;
      }
      setStep(4);
    } catch {
      setSubmitError("No pudimos guardar la inscripción. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setDraft(emptyDraft());
    setErrors({});
    setSubmitError("");
    setStep(0);
  }

  return (
    <MuseumChrome
      step={step}
      actions={
        step === 0 ? (
          <PrimaryButton onClick={() => setStep(1)}>Comenzar inscripción</PrimaryButton>
        ) : step === 1 ? (
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <QuietButton onClick={() => setStep(0)}>Volver</QuietButton>
            <PrimaryButton onClick={goToDetails}>Continuar</PrimaryButton>
          </div>
        ) : step === 2 ? (
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <QuietButton onClick={() => setStep(1)}>Volver</QuietButton>
            <PrimaryButton onClick={goToReview}>Revisar inscripción</PrimaryButton>
          </div>
        ) : step === 3 ? (
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <QuietButton onClick={() => setStep(2)}>Volver</QuietButton>
            <PrimaryButton onClick={submit} disabled={submitting}>
              {submitting ? "Guardando…" : "Enviar inscripción"}
            </PrimaryButton>
          </div>
        ) : (
          <PrimaryButton onClick={restart}>Registrar a otra persona</PrimaryButton>
        )
      }
    >
      {step === 0 ? <Welcome /> : null}
      {step === 1 ? <Details draft={draft} errors={errors} update={update} /> : null}
      {step === 2 ? <Activities draft={draft} errors={errors} update={update} /> : null}
      {step === 3 ? <Review draft={draft} submitError={submitError} onEdit={setStep} /> : null}
      {step === 4 ? <Confirmation name={draft.fullName.trim()} activity={draft.activity} /> : null}
    </MuseumChrome>
  );
}

function Welcome() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-sm font-medium tracking-[0.18em] text-clay-deep uppercase">
          Dos experiencias para participar
        </p>
        <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[0.95] text-ink sm:text-7xl">
          ¡Bienvenido(a)!
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/80">
          El Museo de Arte Contemporáneo de UNIMINUTO te invita a vivir, crear y compartir el arte.
          Regístrate y elige la experiencia en la que quieres participar. ¡Tu participación hace parte
          de esta historia!
        </p>
      </div>
      <div className="mx-auto w-full max-w-sm">
        <Image
          src="/mac-fachada.jpg"
          alt="Fachada del Museo de Arte Contemporáneo de UNIMINUTO"
          width={575}
          height={1024}
          priority
          sizes="(min-width: 1024px) 24rem, 100vw"
          className="h-auto w-full rounded-[28px]"
        />
      </div>
    </div>
  );
}

function Details({
  draft,
  errors,
  update,
}: {
  draft: RegistrationDraft;
  errors: FieldErrors;
  update: <K extends keyof RegistrationDraft>(key: K, value: RegistrationDraft[K]) => void;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-medium tracking-[0.18em] text-clay-deep uppercase">Registro</p>
      <h1 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">Tus datos</h1>
      <p className="mt-4 max-w-xl text-ink/75">
        Los usaremos solo para organizar tu participación y avisarte la fecha, el horario y el lugar.
      </p>
      <div className="mt-8 grid gap-5">
        <Field label="Nombre completo" hint="Escribe tus nombres y apellidos." error={errors.fullName} htmlFor="fullName">
          <input
            id="fullName"
            name="fullName"
            autoComplete="name"
            value={draft.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            aria-invalid={Boolean(errors.fullName)}
            className={inputClass(Boolean(errors.fullName))}
          />
        </Field>
        <Field label="Edad" hint="Indica tu edad en años." error={errors.age} htmlFor="age">
          <input
            id="age"
            name="age"
            inputMode="numeric"
            autoComplete="off"
            value={draft.age}
            onChange={(event) => update("age", event.target.value.replace(/[^\d]/g, "").slice(0, 3))}
            aria-invalid={Boolean(errors.age)}
            className={inputClass(Boolean(errors.age))}
          />
        </Field>
        <Field
          label="Gustos culturales"
          hint="Cuéntanos qué expresiones culturales o artísticas te interesan."
          error={errors.culturalInterests}
          htmlFor="culturalInterests"
        >
          <textarea
            id="culturalInterests"
            name="culturalInterests"
            rows={3}
            value={draft.culturalInterests}
            onChange={(event) => update("culturalInterests", event.target.value)}
            aria-invalid={Boolean(errors.culturalInterests)}
            className={inputClass(Boolean(errors.culturalInterests))}
          />
        </Field>
        <Field label="Número de teléfono" hint="Escribe un número de contacto." error={errors.phone} htmlFor="phone">
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={draft.phone}
            onChange={(event) => update("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            className={inputClass(Boolean(errors.phone))}
          />
        </Field>
        <Field
          label="Ocupación"
          hint="Indica si estudias, trabajas, eres artista u otra ocupación."
          error={errors.occupation}
          htmlFor="occupation"
        >
          <select
            id="occupation"
            name="occupation"
            value={draft.occupation}
            onChange={(event) => update("occupation", event.target.value as RegistrationDraft["occupation"])}
            aria-invalid={Boolean(errors.occupation)}
            className={inputClass(Boolean(errors.occupation))}
          >
            <option value="">Selecciona una opción</option>
            {OCCUPATIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
        <div>
          <label className="flex items-start gap-3 text-ink" htmlFor="consent">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              checked={draft.consent}
              onChange={(event) => update("consent", event.target.checked)}
              className="mt-1 size-5 accent-clay-deep"
            />
            <span>Autorizo el tratamiento de mis datos personales para esta inscripción.</span>
          </label>
          {errors.consent ? <p className="mt-2 text-sm text-clay-deep">{errors.consent}</p> : null}
        </div>
      </div>
    </div>
  );
}

function Activities({
  draft,
  errors,
  update,
}: {
  draft: RegistrationDraft;
  errors: FieldErrors;
  update: <K extends keyof RegistrationDraft>(key: K, value: RegistrationDraft[K]) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium tracking-[0.18em] text-clay-deep uppercase">Actividad</p>
      <h1 className="mt-3 max-w-2xl font-serif text-4xl text-ink sm:text-5xl">Elige una experiencia</h1>
      <p className="mt-4 max-w-xl text-ink/75">Solo puedes escoger una. La fecha, el horario y el lugar se confirman después.</p>
      <div className="mt-8 grid gap-4 lg:grid-cols-2" role="radiogroup" aria-label="Actividades">
        {ACTIVITIES.map((activity) => {
          const selected = draft.activity === activity.value;
          return (
            <label
              key={activity.value}
              className={`cursor-pointer overflow-hidden rounded-3xl border bg-card transition ${
                selected ? "border-ink ring-2 ring-ink" : "border-line hover:border-ink/40"
              }`}
            >
              <input
                className="sr-only"
                type="radio"
                name="activity"
                value={activity.value}
                checked={selected}
                onChange={() => update("activity", activity.value)}
              />
              <div className="relative h-56 sm:h-64">
                <Image
                  src={activity.value === "sensorial" ? "/obra-sensorial.png" : "/deja-tu-huella.jpg"}
                  alt={
                    activity.value === "sensorial"
                      ? "Participante con los ojos cubiertos junto a una obra de plastilina"
                      : "Personaje dejando una marca en un muro"
                  }
                  fill
                  sizes="(min-width: 1024px) 36rem, 100vw"
                  className={
                    activity.value === "sensorial"
                      ? "object-cover object-[center_58%]"
                      : "object-cover object-[center_28%]"
                  }
                />
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-xs font-medium tracking-[0.16em] text-moss uppercase">
                  {selected ? "Elegida" : activity.subtitle}
                </p>
                <h2 className="mt-2 font-serif text-3xl text-ink">{activity.title}</h2>
                <p className="mt-3 text-ink/80">{activity.summary}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">{activity.note}</p>
              </div>
            </label>
          );
        })}
      </div>
      {errors.activity ? <p className="mt-4 text-sm text-clay-deep">{errors.activity}</p> : null}
    </div>
  );
}

function Review({
  draft,
  submitError,
  onEdit,
}: {
  draft: RegistrationDraft;
  submitError: string;
  onEdit: (step: number) => void;
}) {
  const rows = [
    ["Nombre", draft.fullName.trim()],
    ["Edad", draft.age],
    ["Gustos culturales", draft.culturalInterests.trim()],
    ["Teléfono", draft.phone.trim()],
    ["Ocupación", draft.occupation ? occupationLabel(draft.occupation) : ""],
    ["Actividad", draft.activity ? activityLabel(draft.activity) : ""],
  ];

  return (
    <div className="max-w-2xl">
      <p className="text-sm font-medium tracking-[0.18em] text-clay-deep uppercase">Confirmación</p>
      <h1 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">Revisa tu inscripción</h1>
      <p className="mt-4 text-ink/75">Si algo no está bien, puedes corregirlo antes de enviar.</p>
      <dl className="mt-8 divide-y divide-line rounded-3xl border border-line bg-card">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-4">
            <dt className="text-sm text-ink/55">{label}</dt>
            <dd className="text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <button type="button" className="text-moss underline underline-offset-4" onClick={() => onEdit(1)}>
          Corregir datos
        </button>
        <button type="button" className="text-moss underline underline-offset-4" onClick={() => onEdit(2)}>
          Cambiar actividad
        </button>
      </div>
      {submitError ? <p className="mt-4 text-sm text-clay-deep">{submitError}</p> : null}
    </div>
  );
}

function Confirmation({ name, activity }: { name: string; activity: Activity | "" }) {
  const firstName = name.split(" ")[0];
  return (
    <div className="max-w-2xl">
      <p className="font-serif text-sm tracking-[0.2em] text-clay-deep uppercase">Inscripción recibida</p>
      <h1 className="mt-4 font-serif text-5xl leading-[0.95] text-ink sm:text-7xl">¡Ya puedes participar!</h1>
      <p className="mt-6 text-lg leading-relaxed text-ink/80">
        Gracias{firstName ? `, ${firstName}` : ""}. Tu participación nos ayuda a construir un museo más
        creativo, cercano e incluyente.
      </p>
      {activity ? (
        <p className="mt-6 rounded-3xl bg-card px-5 py-4 text-ink">
          Actividad elegida: <span className="font-medium">{activityLabel(activity)}</span>
        </p>
      ) : null}
      <p className="mt-4 max-w-xl text-ink/75">
        La fecha, el horario y el lugar te los comunicará el museo al teléfono que registraste.
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint: string;
  error?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  const describedBy = error ? `${htmlFor}-hint ${htmlFor}-error` : `${htmlFor}-hint`;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby": describedBy,
      })
    : children;

  return (
    <div>
      <label htmlFor={htmlFor} className="block text-base font-medium text-ink">
        {label}
      </label>
      <p id={`${htmlFor}-hint`} className="mt-1 text-sm text-ink/60">
        {hint}
      </p>
      <div className="mt-2">{control}</div>
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-2 text-sm text-clay-deep">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function inputClass(invalid: boolean): string {
  return `w-full rounded-2xl border bg-card px-4 py-3 text-lg text-ink outline-none transition placeholder:text-ink/30 focus:border-ink ${
    invalid ? "border-clay" : "border-line"
  }`;
}
