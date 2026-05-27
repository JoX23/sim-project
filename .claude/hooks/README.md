# Hooks

Hooks shell ejecutados por Claude Code en eventos del agente. F1 implementa
solo `PreToolUse`. F2 añadirá `PostToolUse` para telemetría estructurada.

## Activar el hook

Edita tu `.claude/settings.json` (o `.claude/settings.local.json`) añadiendo:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "bash .claude/hooks/pre-tool.sh" }
        ]
      }
    ]
  }
}
```

Ver `.claude/settings.template.json` para la configuración completa de referencia.

Y dale permisos de ejecución:
```bash
chmod +x .claude/hooks/pre-tool.sh
```

## Qué hace `pre-tool.sh` (F1)

Tier gate determinista. Para invocaciones de `Bash`:

1. Lee el JSON del hook desde stdin
2. Extrae el comando
3. Matchea contra patrones de tier `full-access` (`_contract.md §3`):
   - `git push`, `git push --force`, `git reset --hard`, `git clean -f`
   - `rm -rf`
   - `npm/pnpm/yarn/pip/cargo/gem publish`
   - `gh release create`, `gh pr merge`
   - Modificaciones a `.env*`
4. Matchea contra lecturas de credenciales (siempre block):
   - `~/.ssh/`, `~/.aws/`, `/etc/shadow`, `/etc/sudoers`
5. Si match → exit 2 con mensaje a stderr (Claude Code muestra al usuario)
6. Si no → exit 0 (permite la operación)

El usuario puede aprobar manualmente respondiendo al prompt de Claude Code,
o el hook puede ser bypass-eado en `settings.local.json` para casos específicos.

## Qué hará `post-tool.sh` (F2)

- Escribir span JSONL estructurado a `.claude/telemetry/<session>.jsonl`
- Trackear tokens consumidos en sesión
- Si excede 80% del budget → modificar env vars que skills leen para entrar en modo lean
- Comprimir telemetry > 30 días, eliminar > 90 días

Schema del span (F2):
```json
{
  "ts": "ISO 8601",
  "session_id": "ULID",
  "tool": "Bash | ctx_read | Edit | ...",
  "args_hash": "sha1 (no plaintext args por privacy)",
  "tokens_in": N,
  "tokens_out": N,
  "result": "ok | error | partial",
  "permission_tier": "read-only | sandbox-edit | full-access",
  "command_context": "/plan | /ship | /triage | adhoc"
}
```

## Debugging

Si el hook bloquea algo legítimo, revisa los patterns en `pre-tool.sh` y ajusta.
Para desactivarlo temporalmente, quita el bloque `hooks` de `settings.json` o
`settings.local.json`.

Para ver qué payload recibe el hook:
```bash
# Añade al inicio de pre-tool.sh para debug:
echo "$HOOK_INPUT" >> /tmp/hook-debug.log
```

## Portabilidad

`pre-tool.sh` está escrito en bash POSIX-friendly con fallback `grep` si `jq`
no está instalado. Funciona en macOS (bash 3.2+) y Linux. Windows requiere
Git Bash o WSL.
