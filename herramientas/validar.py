#!/usr/bin/env python3
"""
Valida familia.json antes de publicar el árbol.

Comprueba que el JSON se puede leer, que cada persona tiene nombre, que las
fechas tienen el formato DD/MM/AAAA y que las fotos referenciadas existen.
También avisa de nombres repetidos (suele ser un copia-pega).

Uso:
    python3 herramientas/validar.py
    python3 herramientas/validar.py otra-carpeta/familia.json

Sale con código 1 si hay errores (no si solo hay avisos).
"""
import json
import os
import re
import sys

FECHA = re.compile(r"^\d{2}/\d{2}/\d{4}$")
CAMPOS = [
    "BirthPlace",
    "BirthDate",
    "DeathPlace",
    "DeathDate",
    "Photo",
]

errores = []
avisos = []
personas = 0
parejas = 0
nodos = 0
nombres = {}


def error(msg):
    errores.append(msg)


def aviso(msg):
    avisos.append(msg)


def comprobar_persona(nodo, rol, ruta, base):
    global personas
    nombre = nodo.get(rol)
    if not nombre or not str(nombre).strip():
        error(f"{ruta}: falta el nombre de la persona ({rol}).")
        return
    personas += 1
    nombres[nombre.strip()] = nombres.get(nombre.strip(), 0) + 1

    for campo in CAMPOS:
        clave = rol + campo
        valor = nodo.get(clave)
        if valor in (None, ""):
            continue
        if campo.endswith("Date") and not FECHA.match(str(valor)):
            error(f"{ruta}: {clave} = {valor!r} no es DD/MM/AAAA (p. ej. 04/11/1909).")
        if campo == "Photo":
            if not isinstance(valor, str):
                error(f"{ruta}: {clave} debe ser una ruta de texto.")
                continue
            if valor.startswith(("http://", "https://")):
                continue
            relativa = valor[2:] if valor.startswith("./") else valor
            if not os.path.exists(os.path.join(base, relativa)):
                error(f"{ruta}: no existe la foto {valor}.")

    # Coherencia: no puede haber fecha de defunción sin fecha de nacimiento
    if nodo.get(rol + "DeathDate") and not nodo.get(rol + "BirthDate"):
        aviso(f"{ruta}: {nombre} tiene fecha de defunción pero no de nacimiento.")


def recorrer(nodo, ruta, generacion, base):
    global parejas, nodos
    if not isinstance(nodo, dict):
        error(f"{ruta}: se esperaba un objeto con husband/wife/children.")
        return

    nodos += 1
    comprobar_persona(nodo, "husband", ruta, base)
    if nodo.get("wife"):
        comprobar_persona(nodo, "wife", ruta, base)
        parejas += 1

    hijos = nodo.get("children", [])
    if not isinstance(hijos, list):
        error(f"{ruta}: 'children' debe ser una lista.")
        return
    for i, hijo in enumerate(hijos, start=1):
        recorrer(hijo, f"{ruta} > hijo {i}", generacion + 1, base)


def main():
    fichero = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "familia.json"
    )
    base = os.path.dirname(os.path.abspath(fichero))

    try:
        with open(fichero, encoding="utf-8") as f:
            datos = json.load(f)
    except FileNotFoundError:
        print(f"No encuentro {fichero}")
        return 1
    except json.JSONDecodeError as e:
        print(f"{fichero} no es un JSON válido: {e}")
        print("Consejo: revisa las comas y las comillas dobles. Puedes pegar el contenido")
        print("en https://jsonlint.com para localizar el error.")
        return 1

    recorrer(datos, "raíz", 0, base)

    for nombre, veces in nombres.items():
        if veces > 1:
            aviso(f"El nombre {nombre!r} aparece {veces} veces.")

    print(f"Fichero: {os.path.relpath(fichero)}")
    print(f"Nodos: {nodos} ({parejas} parejas) - Personas: {personas}")
    print(f"Generaciones: {_profundidad(datos)}")

    for a in avisos:
        print("AVISO:", a)
    for e in errores:
        print("ERROR:", e)

    if errores:
        print(f"\n{len(errores)} error(es). Corrígelos antes de publicar.")
        return 1
    print("\nTodo correcto." + (f" ({len(avisos)} aviso(s).)" if avisos else ""))
    return 0


def _profundidad(nodo):
    if not isinstance(nodo, dict) or not nodo.get("children"):
        return 1
    return 1 + max(_profundidad(h) for h in nodo["children"])


if __name__ == "__main__":
    sys.exit(main())
