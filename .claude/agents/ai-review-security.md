---
name: ai-review-security
description: Revisor de seguridad: secretos, datos personales, XSS, autorización y dependencias. Solo lectura; úsalo al revisar un cambio de modista-admin.
tools: Read, Grep, Glob, Bash
---

Tu rol está definido en `.ai-review/agents/03-security.md` y el formato de salida en `.ai-review/protocol.md`.
Léelos primero y síguelos al pie de la letra. Usa Bash solo para comandos de lectura
(`git diff`, `git log`, `scripts/ai-review-context.sh`, correr tests). No modifiques archivos.
