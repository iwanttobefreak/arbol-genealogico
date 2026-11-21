# Historial de cambios

## 1.0.0 — 2026-11-21

Primera versión pública, publicada como plantilla reutilizable.

- Árbol genealógico con una ficha por persona: foto, nombre, nacimiento y
  defunción (fecha y lugar).
- Parejas unidas por línea, hijos colgando de la pareja de padres.
- Clic para resaltar las conexiones; doble clic (o doble toque) para
  desplegar/plegar los hijos.
- Botones **Expandir todo**, **Centrar árbol** y **Escala de Años** (línea
  temporal por año de nacimiento con franjas por década).
- Datos en `familia.json`; sin base de datos ni backend.
- Título configurable desde `familia.json` (`title`).
- Datos de ejemplo inventados (5 generaciones) y fotos de ejemplo incluidas.
- `herramientas/validar.py` para comprobar el JSON y las fotos antes de
  publicar.
- `herramientas/crear_fotos_ejemplo.py` para generar las fotos de ejemplo.
- El árbol se encuadra solo al cargar (antes había que pulsar «Centrar árbol»).
- Todo el aspecto (tamaño de ficha, separaciones, zoom y colores por
  generación) en el objeto `CONFIG` de `script.js`.
