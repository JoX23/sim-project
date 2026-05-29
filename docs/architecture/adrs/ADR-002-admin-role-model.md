# ADR-002 — Modelo de autorización por rol (RBAC)

**Status**: Accepted
**Date**: 2026-05-28
**Plan**: 06f742nh45ej7hatx4pgpr13zd

## Contexto

El campo `UserRole = 'user' | 'admin'` existe en la DB desde el plan de JWT auth pero nunca se ha enforcement. Sin política de autorización, todos los usuarios autenticados tienen acceso idéntico (solo restringido por ownership). A medida que el API crece, se necesita un modelo de autorización explícito.

## Decisión

Adoptamos **RBAC simple de dos niveles** (`user` / `admin`) implementado via lookup en DB en tiempo de request:

- La función `isAdmin(req: AuthedRequest): Promise<boolean>` en `src/middleware/auth.ts` hace lookup de `req.user.email` en la DB y verifica `role === 'admin'`
- Las rutas que requieren permisos elevados llaman `isAdmin` antes del ownership check
- El role **no se incluye en el JWT** — se consulta la DB en cada request para evitar tokens stale

## Alternativas consideradas

| Alternativa | Por qué descartada |
|---|---|
| Role en JWT payload | Tokens stale si el role cambia; requiere rotación de tokens |
| Middleware `requireAdmin` separado | Over-engineering para 2 rutas; isAdmin es suficiente |
| ACL por recurso | Complejidad innecesaria para el scope actual |

## Consecuencias

- Cada request a DELETE/PATCH con caller distinto al target hace 1 lookup extra en DB (aceptable, DB in-memory)
- Para producción con DB real: considerar cache de roles o incluir role en JWT con TTL corto
- Futuras rutas admin-only importan `isAdmin` desde `auth.ts` — no crear nuevas abstracciones sin revisar este ADR
