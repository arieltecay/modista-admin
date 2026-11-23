# Revisión multiagente (modista-admin)

Protocolo portable para que Claude, Codex u otra IA revisen una tarea terminada con el mismo contrato.
Los agentes son roles en Markdown; en Claude Code también existen como subagentes en `.claude/agents/`.

## Activación

1. Leer `AGENTS.md` (raíz de `full_modista_app`) y `docs/agent/*`.
2. Ejecutar `scripts/ai-review-context.sh` y correr los gates: `npm run typecheck`, `npm run lint`,
   `npm test`, `npm run test:e2e`, `npm run build`. Registrar fallas previas.
3. Lanzar los agentes 01–05 en paralelo con el contexto del paso 2 (rama, diff, gates).
4. Lanzar el 06 con los informes de 01–05.
5. Consolidar en `.ai-review/reports/<fecha>-<tarea>.md`, corregir lo confirmado y repetir los agentes afectados.

## Agentes

- `01-tests.md`: cobertura, regresiones y pruebas faltantes.
- `02-adversarial.md`: casos límite y fuzzing seguro contra el API simulado.
- `03-security.md`: secretos, datos personales, XSS, autorización y dependencias.
- `04-architecture.md`: capas, contratos, tipos locales y convenciones.
- `05-simplifier.md`: duplicación, complejidad y código muerto.
- `06-independent-reviewer.md`: gate final y priorización.

Ciclo: `implementar → revisar en paralelo → confirmar → corregir → verificar → revisar de nuevo`.

## Notas

- Esta copia es la canónica para modista-admin (está versionada). `../.ai-review` es una plantilla local
  sin git: si se mejora un rol aquí, copiarlo allá a mano.
- Permisos: arquitectura y simplificación no tienen Bash. Tests, adversarial, seguridad y final sí, para
  correr tests y `git`. `.claude/settings.json` autoriza esos comandos de lectura y pide confirmación
  para todo lo que escribe o publica (commit, push, reset, checkout, rm, npm install, sed -i, merge).
  Las reglas valen para toda sesión en el repo, no solo para los revisores.
