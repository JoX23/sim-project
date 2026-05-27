---
adr_id: 001
title: "Introducir JWT auth con jsonwebtoken como dep core"
status: accepted
date: 2026-05-27
deciders: [Jose Mariscal]
related_plans: [01ksmf34kx4nxnzpjzqa7n6kg2]
supersedes: null
superseded_by: null
---

# ADR-001 — Introducir JWT auth con jsonwebtoken como dep core

## Contexto

Endpoint `/users` actualmente público. Necesitamos auth antes de expandir a más rutas con PII.

## Decisión

Usar `jsonwebtoken` (npm) como verificador JWT, con `JWT_SECRET` desde env. Middleware monta selectivo (no en `/health`).

### Alternativas consideradas

- **session cookies + Redis** — descartada: requiere Redis infra; sim-project no la tiene
- **JWT custom HMAC inline** — descartada: re-inventar crypto es mala señal
- **OAuth provider externo (Auth0)** — descartada para MVP: overkill, latencia extra

## Consecuencias

### Positivas
- Stateless: scaling horizontal trivial
- Standard JWT permite interop con clients y herramientas (jwt.io)

### Negativas / Trade-offs
- Revocación requiere blacklist (no implementada en esta iteración)
- `JWT_SECRET` debe rotarse periódicamente → futuro runbook

### Neutrales
- Dep `jsonwebtoken` es estándar y bien mantenida; `@types/jsonwebtoken` también

## Implementación

Ver plan `01ksmf34kx4nxnzpjzqa7n6kg2`.

## Cuándo revisar

- Si añadimos OAuth providers externos → puede que JWT propio sea redundante
- Si revocación se vuelve crítica → considerar opaque tokens + Redis
