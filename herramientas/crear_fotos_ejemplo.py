#!/usr/bin/env python3
"""
Genera las fotos de ejemplo (placeholders) de este repositorio.

Crea en fotos/ unas siluetas de 300x400 px con las iniciales de la persona.
Sirve para que el árbol de ejemplo se vea completo sin usar fotos reales.

Uso:
    python3 herramientas/crear_fotos_ejemplo.py

Necesita Pillow:  pip install pillow
"""
import os
from PIL import Image, ImageDraw, ImageFont

ANCHO, ALTO = 300, 400
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(BASE, "fotos")
FUENTE = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# (fichero, iniciales, color de fondo, color de la silueta)
FOTOS = [
    ("ejemplo-01.png", "MG", "#dbeafe", "#3b82f6"),
    ("ejemplo-02.png", "CR", "#fce7f3", "#db2777"),
    ("ejemplo-03.png", "JG", "#dcfce7", "#16a34a"),
    ("ejemplo-04.png", "MF", "#ffedd5", "#ea580c"),
    ("ejemplo-05.png", "AG", "#ede9fe", "#7c3aed"),
    ("ejemplo-06.png", "LM", "#ccfbf1", "#0d9488"),
    ("ejemplo-07.png", "PG", "#fee2e2", "#dc2626"),
    ("ejemplo-08.png", "AV", "#e0e7ff", "#4f46e5"),
]


def dibujar(fichero, iniciales, fondo, tinta):
    img = Image.new("RGB", (ANCHO, ALTO), fondo)
    dibujo = ImageDraw.Draw(img)
    # cabeza
    r = 70
    cx, cy = ANCHO // 2, 150
    dibujo.ellipse([cx - r, cy - r, cx + r, cy + r], fill=tinta)
    # hombros
    dibujo.ellipse([cx - 130, cy + 90, cx + 130, cy + 420], fill=tinta)
    # iniciales
    try:
        fuente = ImageFont.truetype(FUENTE, 60)
    except OSError:
        fuente = ImageFont.load_default()
    caja = dibujo.textbbox((0, 0), iniciales, font=fuente)
    ancho_texto = caja[2] - caja[0]
    alto_texto = caja[3] - caja[1]
    dibujo.text(
        ((ANCHO - ancho_texto) / 2 - caja[0], ALTO - 65 - alto_texto - caja[1]),
        iniciales,
        font=fuente,
        fill=fondo if fondo != tinta else "#ffffff",
    )
    img.save(os.path.join(DESTINO, fichero), "PNG", optimize=True)


def main():
    os.makedirs(DESTINO, exist_ok=True)
    for foto in FOTOS:
        dibujar(*foto)
        print("creada fotos/" + foto[0])


if __name__ == "__main__":
    main()
