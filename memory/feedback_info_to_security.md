---
name: feedback-info-to-security
description: Un finding (info) del reviewer en DELETE puede escalar a security triage — no minimizar los info sobre access control
metadata:
  type: feedback
---

La evidence de `01ksvejh4m2k0nm8yp6xy7bvq3r` (DELETE /users) marcó como `(info)` que
cualquier usuario autenticado podía borrar a cualquier otro. Al día siguiente QA lo
escaló a triage de seguridad (`01ksxf2mn2k0nm4yp6xy7bvq4s`).

**Why:** El plan no incluyó un AC de ownership ("solo puedes borrar tu propio usuario"),
así que el reviewer no lo pudo bloquear como violación de AC. Sin invariant en el plan,
el gap llegó a producción.

**How to apply:** Para endpoints de mutación de datos de usuario (DELETE, PATCH propios),
añadir siempre un invariant explícito de ownership en el plan:
`"Solo el JWT cuyo email coincide con el :email del path puede ejecutar la operación"`.
Si el AC no lo especifica, el reviewer tampoco puede bloquearlo — la guardia nace en el plan.
