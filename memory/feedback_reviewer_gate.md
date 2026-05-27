---
name: feedback-reviewer-gate
description: El reviewer actúa como gate efectivo entre plan y código — detecta omisiones del implementer
metadata:
  type: feedback
---

El reviewer bloqueó el ship en ciclo 1 de `01kssspk4r2x5v7n3qz8tm6yw9` porque el
implementer no trasladó el campo `total` del AC-2 al DB layer (`listUsers`).

**Why:** El plan declaraba `{ users, total }` en AC-2, pero el implementer solo implementó
`{ users }`. El reviewer leyó el plan + el diff y detectó la discrepancia. Sin este gate,
la omisión habría llegado a producción rota.

**How to apply:** No saltarse el reviewer aunque el cambio parezca trivial. Si el plan
tiene AC con contratos de response body, el reviewer los verifica contra el diff real.
Considerar añadir assertion explícita en el test para cada campo del response body declarado en AC.
