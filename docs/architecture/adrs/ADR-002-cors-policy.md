---
id: ADR-002
status: accepted
date: 2026-06-05
plan_ref: 01kt9f8mn2k0nm4yp6xy7bvqax
---

# ADR-002 — Política CORS y selección del paquete `cors`

## Contexto

El frontend React (origin `http://localhost:3001` en dev, dominio configurado en prod) consume la API directamente desde el browser. Sin cabeceras CORS, el browser bloquea todos los requests con `Cross-Origin Request Blocked`.

Necesitamos una política CORS que:
1. Permita los orígenes autorizados (frontend conocido)
2. Soporte credentials (el frontend envía `Authorization: Bearer ...`)
3. Sea configurable por entorno sin rebuild

## Opciones consideradas

**A) Paquete `cors` de npm** (seleccionada)
- Pros: battle-tested, maneja pre-flight OPTIONS automáticamente, configurable
- Cons: dependencia externa adicional

**B) CORS headers manuales en un middleware propio**
- Pros: sin nueva dependencia
- Cons: fácil olvidar algún header (ej. `Vary: Origin`), reimplementar logic ya probada

**C) Delegar CORS al reverse proxy (nginx/Caddy)**
- Pros: sin código, centralizado en infra
- Cons: requiere cambios de infra; en dev no hay reverse proxy; el frontend necesita CORS en test también

## Decisión

**Opción A** — usar el paquete `cors` con configuración explícita de orígenes vía `CORS_ORIGINS` env var.

Razones:
- El paquete es estándar y bien mantenido (top-50 npm, sin deps propias)
- El manejo de `Vary: Origin` y pre-flight automático evita errores sutiles de implementación manual
- `CORS_ORIGINS` como env var permite diferencias dev/staging/prod sin rebuild

## Consecuencias

- `npm install cors @types/cors` requerido antes del primer deploy (full-access tier, HITL)
- `CORS_ORIGINS` **debe** estar seteada en producción — si falta, el default `localhost:3001` bloqueará todos los requests de prod → **riesgo de misconfiguration**
- Si en el futuro se introduce un reverse proxy, esta política puede eliminarse sin cambios al código de la API

## Mitigaciones

- `CORS_ORIGINS` sin valor en prod → warning en startup (a implementar en follow-up)
- Añadir `CORS_ORIGINS` a `.env.example` con comentario explicativo
