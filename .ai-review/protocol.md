# Contrato de revisión

## Entrada obligatoria

Cada agente recibe:

- repositorio afectado;
- objetivo de la tarea;
- diff y archivos modificados;
- reglas locales (`AGENTS.md`, `docs/agent/`, skills aplicables);
- resultados de typecheck, lint, tests (`npm test`, `npm run test:e2e`) y build, incluyendo fallos preexistentes.

Si un dato no está disponible, debe marcarlo como `no verificado`, nunca asumir que pasó.

## Reglas propias de modista-admin

- El admin no cambia contratos del API: mismas rutas, métodos y payloads. Los tests de página
  (`*.test.tsx`) y `e2e/` los fijan; un cambio en ellos debe estar justificado en el diff.
- La UI no muestra estados que el API no entrega (conexión de Meta, entregado/leído, métricas).
- Ningún test ni captura usa datos reales: teléfonos, ids de Instagram o textos de clientes.

## Salida obligatoria

Cada hallazgo debe seguir este formato:

```text
[CRÍTICO|ALTO|MEDIO|BAJO] título
Archivo: ruta:línea
Evidencia: qué se observó
Impacto: qué puede romperse o exponerse
Reproducción: prueba, entrada o razonamiento concreto
Propuesta: cambio mínimo y seguro
Confianza: alta|media|baja
```

Los agentes también deben informar explícitamente `Sin hallazgos` o las limitaciones de su revisión.

## Reglas de calidad

- No proponer refactors amplios sin relación demostrable con la tarea.
- No llamar bug a una preferencia de estilo.
- No sugerir desactivar tests, lint, tipos o controles de seguridad.
- Priorizar fallos reproducibles y contratos observables.
- Las pruebas adversariales deben ser deterministas, acotadas y sin atacar servicios externos.
- Nunca incluir secretos o datos personales en el informe.

## Puerta de salida

La tarea solo puede declararse lista cuando:

1. no quedan hallazgos críticos o altos confirmados;
2. el código modificado pasa los gates del repositorio;
3. los hallazgos medios/bajos aceptados quedan documentados;
4. la revisión final indica qué no pudo verificarse.
