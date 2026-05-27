---
name: project-f1-progress
description: Estado del sim-project tras 9 días — F1 CONSOLIDADO, métricas estables
metadata:
  type: project
---

Harness F1 consolidado con 17 planes ejecutados en 9 días sobre sim-project TypeScript/Express.
**Estado: F1 CONSOLIDADO. 2 días adicionales de uso real confirman estabilidad del loop.**

**Why:** El sim-project existe para validar que el loop /plan → /ship → /triage funciona
en condiciones de uso real antes de aplicar el harness a proyectos de producción.

**How to apply:** Al iniciar nueva sesión, el sim-project tiene endpoints:
- `GET /health` — público, sin auth
- `GET /users/me` — perfil del JWT actual, requiere JWT con claim email
- `GET /users` — lista con paginación `{ users, total, page, limit, totalPages, hasNext }`, requiere JWT
- `GET /users/search?name=` — búsqueda substring case-insensitive, requiere JWT
- `GET /users/:email` — busca por email con validación 400/404, requiere JWT
- `POST /users` — crea usuario con createdAt + updatedAt, 409 en duplicado, requiere JWT
- `PATCH /users/:email` — actualiza name propio (403 si JWT no coincide, trim, refresca updatedAt), requiere JWT
- `DELETE /users/:email` — borra propio usuario (403 si JWT no coincide), requiere JWT

Stack acumulado: 36 tests, 3 middlewares (logger, auth, json), 1 util (validation.ts),
DB in-memory con email/name/createdAt/updatedAt. Route order: /me, /, /search, /:email (crítico).

**Métricas F1 (9 días / 17 planes):**
- 13 /ship exitosos (9 en 1 ciclo, 4 en 2 ciclos)
- 4 /triage exitosos (email 400, duplicate 409, delete ownership 403, patch empty-name 400)
- 1 ADR creado (ADR-001 JWT)
- ship_cycles=2 en `01kssspk4r2x5v7n3qz8tm6yw9`: reviewer detectó total faltante
- ship_cycles=2 en `01ksvrkp3x5v7n3qz8tm6yw9cd`: reviewer detectó non-null assertion sin guardia
- ship_cycles=2 en `01kt1f8mn2k0nm4yp6xy7bvq6u`: reviewer detectó semántica param-ausente vs param-vacío
- ship_cycles=2 en `01kt3f8mn2k0nm4yp6xy7bvq7v`: TypeScript detectó seed sin updatedAt (invariant AC-3)
- Security bug escalado de info → triage: `01ksxf2mn2k0nm4yp6xy7bvq4s`
- Deuda técnica día 5 cerrada en día 7: untested region createdAt en lista → test añadido
- Deuda técnica PATCH cerrada en día 8: untested region updatedAt → campo añadido al modelo
- Ratio 1-ciclo: 9/13 = ~69% — estable respecto al 8/11 = ~73% de los 7 primeros días

**Lecciones F1 para F2:**
- El ciclo evidence-untested-region → plan al día siguiente funciona orgánicamente
- Los invariants en plan files arman al reviewer para rechazar violaciones de contrato
- TypeScript strict es sensor objetivo: errores de tipo preceden a los tests como signal
- Extensiones backward-compatible (pagination meta) logran ship_cycles=1 de forma predecible
- Refactors atómicos (EMAIL_RE → utils) + extensiones no-breaking ideales para días con baja carga
- Untested regions (total=0, página exacta) quedan como input rastreable para benchmarks F2
