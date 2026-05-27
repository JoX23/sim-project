# MEMORY.md — Index de memorias persistentes

> Este archivo se auto-carga al inicio de cada sesión Claude Code. Mantener ≤200 líneas.
> Body de cada memoria vive en archivos hermanos (`<tipo>_<slug>.md`).
> Detalle de tipos y cuándo escribir: ver [`README.md`](README.md).

## User

<!-- Información sobre el usuario: rol, preferencias, conocimiento previo -->
<!-- - [Rol y stack preferido](user_role.md) — senior fullstack, prefiere TypeScript+Python -->

## Feedback

- [Reviewer como gate efectivo](feedback_reviewer_gate.md) — ciclos 2 en 01kssspk4r2x5v7n3qz8tm6yw9 y 01ksvrkp3x5v7n3qz8tm6yw9cd validaron que el reviewer detecta omisiones del implementer
- [Info en evidence puede escalar a security triage](feedback_info_to_security.md) — ownership check en DELETE marcado como info → escalado a triage de seguridad al día siguiente

## Project

- [Progreso F1 sim-project — 9 días, F1 CONSOLIDADO](project_f1_progress.md) — 2026-06-04, 17 planes, métricas estables

## Reference

- [Plans shipped](docs/plans/) — 17 items: 01ksmevcpvcnyf6nbft5nc39h7 (health), 01ksmf06kv97b1jahnrny12btq (triage email), 01ksmf34kx4nxnzpjzqa7n6kg2 (JWT), 01ksqe7jh8f2ry4tw896gzcz2k (POST users), 01ksqrn3kx4v4r2qx9zt3cmw7m (triage duplicate), 01kssf8mn2k0nm4yp6xy7bvq3p (logger), 01kssspk4r2x5v7n3qz8tm6yw9 (users list), 01ksvejh4m2k0nm8yp6xy7bvq3r (DELETE user), 01ksvrkp3x5v7n3qz8tm6yw9cd (GET /me), 01ksxf2mn2k0nm4yp6xy7bvq4s (triage ownership), 01ksxspk4r2x5v7n3qz8tm6yz1k (createdAt), 01kszf8mn2k0nm4yp6xy7bvq5t (PATCH user), 01kszspk4r2x5v7n3qz8tm6zw1 (triage empty-name), 01kt1f8mn2k0nm4yp6xy7bvq6u (search users, 2 ciclos), 01kt1spk4r2x5v7n3qz8tm7yw2 (refactor validation+createdAt test), 01kt3f8mn2k0nm4yp6xy7bvq7v (add-updated-at, 2 ciclos), 01kt5f8mn2k0nm4yp6xy7bvq8w (pagination-meta)
- [ADR-001](docs/architecture/adrs/ADR-001-introduce-jwt-auth.md) — decisión JWT vs alternativas (2026-05-27)
