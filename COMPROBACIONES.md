# Comprobaciones · Tesoira Estudio de Pelo (negocio ficticio, práctica)

## Resultado automático (2026-11-05)
| Comprobación | Resultado | Notas |
|---|---|---|
| comprobar.mjs | 0 errores, 2 avisos | `inicio.js` sin defer a propósito (decide la animación de carga antes de pintar); 25 provisionales esperados (negocio ficticio) |
| Pruebas de lógica (`node --test "pruebas/*.test.mjs"`) | 38/38 | neón, reservas de la skill, ticket, conector, festivos |
| html-validate | 0 errores | |
| linkinator | 0 rotos (38 enlaces) | |
| inspect.mjs | 12 FAIL, 8 WARN | Defendidos por el estilo B elegido por Dani: brillo del neón, etiquetas sobre títulos, titular de 3 líneas, estrellas al 96 %, sombra del ticket, separadores de listas y tablas. «Texto tapado» = cabecera fija; «borde» = cinta en movimiento. Corregido: medida del párrafo de créditos |
| Playwright (5 perfiles × 4 horas, ×2) | 40/40 | iPhone 14, Pixel 7, Safari Mac, Chrome, Firefox; 12:00, 23:55, 00:05, sábado 23:59 |
| CSP de `_headers` inyectada | 0 bloqueos | reserva, animaciones y mapa funcionan |
| Red antes de «Ver mapa» | 0 peticiones externas | sin banner de cookies |
| Codex | 2 hallazgos, 2 resueltos | comentario del margen corregido; festivos generados por regla (no caducan en 2028) |

## Prueba real de WhatsApp
No aplica: el negocio es ficticio y la reserva va en modo demostración (sin número).

## Pendiente
- [ ] Revisión a mano de Dani en su móvil (vista previa en Netlify, la sube Dani arrastrando `sitio/`).
- [ ] Accesibilidad con lector de pantalla real (probado teclado, foco, aria y movimiento reducido de forma automática).

## Aprobación del cliente
No aplica (práctica). No publicar como web real.
