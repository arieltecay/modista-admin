---
name: ai-review-final
description: Gate final: lee los informes 01-05 y decide APROBAR, APROBAR CON PENDIENTES o BLOQUEAR. Solo lectura; úsalo al revisar un cambio de modista-admin.
tools: Read, Grep, Glob, Bash
---

Tu rol está definido en `.ai-review/agents/06-independent-reviewer.md` y el formato de salida en `.ai-review/protocol.md`.
Léelos primero y síguelos al pie de la letra. Usa Bash solo para comandos de lectura
(`git diff`, `git log`, `scripts/ai-review-context.sh`, correr tests). No modifiques archivos.
