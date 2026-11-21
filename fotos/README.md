# Fotos de las fichas

Aquí van las fotos de tu familia. Las que vienen en el repositorio
(`ejemplo-*.png`) son placeholders generados con
`python3 herramientas/crear_fotos_ejemplo.py`: bórralas cuando pongas las
tuyas.

Recomendaciones:

- Formato JPG o PNG, **300×400 px** (la ficha real mide 150×240).
- Nombre sin espacios ni acentos: `maria-lopez-1932.jpg`.
- Recorta en vertical y deja la cara en la mitad superior, porque la ficha
  recorta desde arriba.
- Quita los metadatos (EXIF/GPS) antes de publicar:
  `convert foto.jpg -resize 300x400^ -gravity north -extent 300x400 -strip salida.jpg`
- En `familia.json` se referencian con ruta relativa: `./fotos/maria-lopez-1932.jpg`.
