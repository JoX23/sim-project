---
id: 06f742nh45ej7hatx4pgpr13zd
parent: null
status: shipped
shipped_at: "2026-05-28T23:10:00Z"
evidence: 06f742nh45ej7hatx4pgpr13zd.evidence.md
intent: "Permitir a admins borrar y patchear cualquier usuario sin ownership check"
tier: sandbox-edit
read_set:
  - src/middleware/auth.ts
  - src/routes/users.ts
  - src/db/users.ts
  - test/users-delete.test.ts
  - test/users-update.test.ts
write_set:
  - src/middleware/auth.ts
  - src/routes/users.ts
  - test/users-admin.test.ts
invariants:
  - "npm test -- --testPathPattern=users-delete pasa sin modificar test/users-delete.test.ts"
  - "npm test -- --testPathPattern=users-update pasa sin modificar test/users-update.test.ts"
  - "non-admins reciben 403 al intentar borrar/patchear email ajeno"
  - "JWT sigue siendo requerido en DELETE y PATCH (401 sin token)"
  - "isAdmin retorna false si el caller no existe en DB"
  - "interfaz pública de findUserByEmail en src/db/users.ts no cambia"
validation_commands:
  - "npm test -- --testPathPattern=users-admin"
  - "npm test -- --testPathPattern=users-delete"
  - "npm test -- --testPathPattern=users-update"
  - "npm run lint"
  - "npm run typecheck"
rollback:
  - "git revert HEAD --no-edit"
estimated_size: S
risk: bajo
created_at: "2026-05-28T22:45:00Z"
behavioral_hypothesis: null
---

## Contexto

`UserRole = 'user' | 'admin'` existe en `src/db/users.ts` desde el plan de JWT auth (01ksmf34kx4nxnzpjzqa7n6kg2) pero ninguna ruta la verifica. DELETE y PATCH aplican únicamente ownership check (`req.user?.email !== email → 403`), lo que hace el campo `role` decorativo y sin efecto operacional. Este plan introduce la primera enforcement de RBAC en el API.

⚠️ Este plan requiere **ADR-002-admin-role-model** antes del `/ship`. Trigger: **modelo de autorización** — primera decisión de política de acceso por rol en el sistema.

## Acceptance Criteria

- [ ] Dado un JWT de usuario con `role: 'admin'`, cuando DELETE `/users/:email` con email ajeno, entonces responde 204 y el usuario es eliminado
- [ ] Dado un JWT de usuario con `role: 'admin'`, cuando PATCH `/users/:email` con email ajeno, entonces responde 200 con el usuario actualizado
- [ ] Dado un JWT de usuario con `role: 'user'`, cuando DELETE `/users/:email` con email ajeno, entonces responde 403 (comportamiento existente sin cambios)
- [ ] Dado un JWT de usuario con `role: 'user'`, cuando PATCH `/users/:email` con email ajeno, entonces responde 403 (comportamiento existente sin cambios)
- [ ] Dado cualquier request sin JWT, cuando DELETE o PATCH, entonces responde 401
- [ ] `isAdmin(req)` retorna `false` si `req.user?.email` no existe en DB

## Diseño técnico

### `isAdmin(req: AuthedRequest): Promise<boolean>`

Exportar desde `src/middleware/auth.ts`. Hace lookup via `findUserByEmail(req.user.email)` y retorna `role === 'admin'`. Retorna `false` en cualquier caso de error (email ausente, usuario no en DB).

```typescript
import { findUserByEmail } from '../db/users';

export async function isAdmin(req: AuthedRequest): Promise<boolean> {
  if (!req.user?.email) return false;
  const caller = await findUserByEmail(req.user.email);
  return caller?.role === 'admin';
}
```

### Modificación en `src/routes/users.ts`

En PATCH y DELETE, reemplazar el ownership check puro por:

```typescript
if (!await isAdmin(req) && req.user?.email !== email) return forbidden(res);
```

El `isAdmin` se importa desde `../middleware/auth`.

## Checklist de riesgos

- [❌] ¿Toca hooks o tier enforcement (`.claude/hooks/`, `settings.json`)? → No, cambio en src/ solamente
- [❌] ¿Modifica `_contract.md` o `AGENTS.md`? → No
- [❌] ¿Algún SKILL.md en write_set? → No
- [❌] ¿Introduce op `full-access` nueva (push, deploy, rm -rf)? → No, sandbox-edit
- [❌] ¿Afecta `harness-test.sh` o validation_commands de otros planes? → No
- [❌] ¿Añade dependencia externa (MCP server, paquete, API)? → No, usa `findUserByEmail` ya existente

## Plan de ejecución

1. Leer `src/middleware/auth.ts` completo para verificar imports existentes
2. Añadir import de `findUserByEmail` desde `'../db/users'` en `auth.ts`
3. Exportar `isAdmin(req: AuthedRequest): Promise<boolean>` al final de `auth.ts`
4. Leer `src/routes/users.ts` completo
5. Añadir import de `isAdmin` desde `'../middleware/auth'` en `routes/users.ts`
6. En PATCH handler: reemplazar `if (req.user?.email !== email) ret forbidden(res);` por `if (!await isAdmin(req) && req.user?.email !== email) return forbidden(res);`
7. En DELETE handler: misma sustitución
8. Crear `test/users-admin.test.ts` con tests que cubran los 6 ACs declarados (usar token de admin con role=admin en DB via `createUser` con role param)
9. Correr `npm test -- --testPathPattern=users-admin` → debe pasar
10. Correr `npm test -- --testPathPattern=users-delete` y `users-update` → deben pasar sin cambios
11. Correr `npm run lint && npm run typecheck`

## Notas de rollback

`git revert HEAD --no-edit` es suficiente — los cambios son aditivos (nueva función + modificación de guards). No hay migración de datos. Si se revierte después de que un admin haya borrado usuarios, los datos en DB en memoria se pierden al restart de todos modos (stub in-memory).
