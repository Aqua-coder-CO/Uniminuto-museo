export const OCCUPATIONS = [
  { value: "estudiante", label: "Estudio" },
  { value: "trabaja", label: "Trabajo" },
  { value: "artista", label: "Soy artista" },
  { value: "otra", label: "Otra ocupación" },
] as const;

export const ACTIVITIES = [
  {
    value: "sensorial",
    title: "Obra sensorial",
    subtitle: "Crear a través del tacto",
    summary:
      "Explora el arte desde el tacto. Cubre tus ojos, siente la plastilina y crea una figura que se unirá a una obra colectiva construida por todos.",
    note: "Es una exploración del tacto y una reflexión sobre distintas formas de percibir. No representa la experiencia de una persona ciega. El equipo del museo acompaña la actividad.",
  },
  {
    value: "huella",
    title: "Deja tu huella",
    subtitle: "Exposición colaborativa",
    summary:
      "Tu creatividad también hace parte del museo. Participa en esta exposición colaborativa y deja tu huella artística en una creación colectiva inspirada en el MAC.",
    note: "Hay una cartelera con la imagen del museo. Cada persona la interviene y deja una marca personal en la pieza colectiva.",
  },
] as const;

export type Occupation = (typeof OCCUPATIONS)[number]["value"];
export type Activity = (typeof ACTIVITIES)[number]["value"];

export type RegistrationInput = {
  fullName: string;
  age: number;
  culturalInterests: string;
  phone: string;
  occupation: Occupation;
  activity: Activity;
  consent: true;
};

export type Registration = RegistrationInput & {
  id: string;
  createdAt: number;
};

export type FieldErrors = Partial<
  Record<
    | "fullName"
    | "age"
    | "culturalInterests"
    | "phone"
    | "occupation"
    | "activity"
    | "consent",
    string
  >
>;

export type RegistrationDraft = {
  fullName: string;
  age: string;
  culturalInterests: string;
  phone: string;
  occupation: Occupation | "";
  activity: Activity | "";
  consent: boolean;
};

export const emptyDraft = (): RegistrationDraft => ({
  fullName: "",
  age: "",
  culturalInterests: "",
  phone: "",
  occupation: "",
  activity: "",
  consent: false,
});

const occupationValues: readonly string[] = OCCUPATIONS.map((item) => item.value);
const activityValues: readonly string[] = ACTIVITIES.map((item) => item.value);

export function occupationLabel(value: string): string {
  return OCCUPATIONS.find((item) => item.value === value)?.label ?? value;
}

export function activityLabel(value: string): string {
  const activity = ACTIVITIES.find((item) => item.value === value);
  return activity ? `${activity.title}: ${activity.subtitle}` : value;
}

export function activityTitle(value: string): string {
  return ACTIVITIES.find((item) => item.value === value)?.title ?? value;
}

function cleanName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function validateDraft(draft: RegistrationDraft): FieldErrors {
  const errors: FieldErrors = {};
  const name = cleanName(draft.fullName);

  if (name.length < 5 || !name.includes(" ")) {
    errors.fullName = "Escribe tus nombres y apellidos.";
  } else if (name.length > 120) {
    errors.fullName = "El nombre es demasiado largo.";
  }

  const age = Number(draft.age);
  if (!draft.age.trim() || !Number.isInteger(age) || age < 1 || age > 120) {
    errors.age = "Indica tu edad en años, entre 1 y 120.";
  }

  const interests = draft.culturalInterests.trim();
  if (interests.length < 3) {
    errors.culturalInterests = "Cuéntanos qué expresiones culturales o artísticas te interesan.";
  } else if (interests.length > 500) {
    errors.culturalInterests = "Resume tus gustos en un texto más corto.";
  }

  const digits = draft.phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    errors.phone = "Escribe un número de contacto, con al menos 7 dígitos.";
  }

  if (!occupationValues.includes(draft.occupation)) {
    errors.occupation = "Indica si estudias, trabajas, eres artista u otra ocupación.";
  }

  if (!activityValues.includes(draft.activity)) {
    errors.activity = "Elige una actividad. Solo puedes escoger una.";
  }

  if (!draft.consent) {
    errors.consent = "Necesitamos tu autorización para usar estos datos en la inscripción.";
  }

  return errors;
}

export function draftToInput(draft: RegistrationDraft): RegistrationInput | null {
  const errors = validateDraft(draft);
  if (Object.keys(errors).length > 0) return null;
  if (draft.occupation === "" || draft.activity === "") return null;

  return {
    fullName: cleanName(draft.fullName),
    age: Number(draft.age),
    culturalInterests: draft.culturalInterests.trim(),
    phone: draft.phone.trim(),
    occupation: draft.occupation,
    activity: draft.activity,
    consent: true,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseRegistration(
  value: unknown,
): { ok: true; data: RegistrationInput } | { ok: false; errors: FieldErrors } {
  if (!isRecord(value)) {
    return { ok: false, errors: { fullName: "La inscripción llegó incompleta." } };
  }

  const draft: RegistrationDraft = {
    fullName: typeof value.fullName === "string" ? value.fullName : "",
    age: typeof value.age === "number" ? String(value.age) : typeof value.age === "string" ? value.age : "",
    culturalInterests: typeof value.culturalInterests === "string" ? value.culturalInterests : "",
    phone: typeof value.phone === "string" ? value.phone : "",
    occupation: typeof value.occupation === "string" && occupationValues.includes(value.occupation)
      ? (value.occupation as Occupation)
      : "",
    activity: typeof value.activity === "string" && activityValues.includes(value.activity)
      ? (value.activity as Activity)
      : "",
    consent: value.consent === true,
  };

  const errors = validateDraft(draft);
  const data = draftToInput(draft);
  if (!data || Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data };
}
