# Inscripción MAC UNIMINUTO

Página para inscribirse en dos experiencias del Museo de Arte Contemporáneo de UNIMINUTO: Obra sensorial y Deja tu huella.

## Uso

```bash
npm install
npm run dev
```

La página pública está en `/`. El listado del museo está en `/admin`.

La contraseña del equipo y el secreto de sesión viven en `.env.local` (`ADMIN_PASSWORD` y `SESSION_SECRET`). Hay un ejemplo en `.env.example`.

Las inscripciones se guardan en `data/registrations.sqlite`. Ese archivo no se publica. Solo quien entra a `/admin` puede ver nombres y teléfonos.
