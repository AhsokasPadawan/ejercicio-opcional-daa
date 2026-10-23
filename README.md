# Primer Trabajo Práctico Optativo — Algoritmo de Dijkstra con Cola de Prioridad
**Diseño y Análisis de Algoritmos — Universidad Argentina de la Empresa (UADE)**

Este proyecto fue desarrollado para preparar y dar la **presentación y defensa oral** del Primer Trabajo Práctico Optativo de la materia. 

El objetivo central del TP es responder formalmente a la consigna de la cátedra:
> *"¿Mejora la complejidad temporal del algoritmo de Dijkstra si en lugar de utilizar el arreglo `U` se utiliza una cola de prioridad?"*

La solución desarrollada no solo responde analíticamente la pregunta, sino que contrasta **tres variantes del algoritmo en paralelo** a través de una plataforma interactiva que permite comparar código, analizar complejidades asintóticas y ejecutar en vivo el algoritmo sobre cualquier grafo en un Sandbox interactivo.

---

## 📂 Estructura del Repositorio

```text
├── backend/                  # Servidor de API (FastAPI) y motor de simulación
│   ├── app.py                # Endpoints HTTP (/api/dijkstra/run, /presets)
│   └── dijkstra_engine.py    # Motor algorítmico, generador de trazas y métricas
├── frontend/                 # Aplicación web de presentación (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/       # Las 3 vistas de la presentación (Código, Complejidad, Sandbox)
│   │   ├── data/             # Seudocódigo, comparativas y presets de grafos
│   │   └── types/            # Definiciones de tipos TypeScript
│   └── package.json          # Dependencias y scripts del frontend
├── teachings/                # 🎓 Material de estudio y preparación para la defensa oral
│   ├── index.html            # Panel central de estudio en el navegador
│   ├── assets/               # Hoja de estilos compartida (styles.css)
│   └── lessons/              # Las 5 lecciones en HTML (una por cada parte de la presentación)
├── context/                  # Apuntes teóricos oficiales de la cátedra en PDF
├── tests/                    # Pruebas automatizadas de algoritmos y API (pytest)
├── dijkstra_tp.py            # Implementación académica limpia de la solución en Python puro
├── requirements.txt          # Dependencias de Python para el backend
└── README.md                 # Este documento
```

---

## 🎓 La Carpeta `teachings/`: Cómo Prepararse para la Defensa Oral

La carpeta [`teachings/`](./teachings/) contiene el material pedagógico completo para dominar todos los conceptos requeridos para la defensa oral. Está organizada en **5 lecciones en formato HTML** diseñadas para leerse cómodamente en cualquier navegador:

* Abrí directamente **[`teachings/index.html`](./teachings/index.html)** en tu navegador para acceder al índice principal.

### Correspondencia entre las Lecciones y la Presentación Oral:

| Lección HTML | Parte de la Exposición | Pestaña de la UI | Temas Clave |
| :--- | :--- | :--- | :--- |
| **`01-explicacion-del-seudocodigo.html`** | **Parte 1** | **1. Comparativa de Código** | Seudocódigo línea por línea de `Nodo`, `crearArreglo` y `actualizar`. Eliminación de `completo` y `buscarMinimo`. Demostración de por qué no se puede eliminar `U` (Variante No Óptima). |
| **`02-explicacion-del-codigo-python.html`** | **Parte 2** | **1. Comparativa de Código** | Traducción a Python: uso de `heapq`, por qué la tupla es `(costo, vertice)`, y mecánica de *Lazy Deletion* con `if arreglo_u[i].selec: continue`. |
| **`03-analisis-de-complejidad.html`** | **Parte 3** | **2. Análisis de Complejidad** | Cálculo de $O(V^2)$ vs. $O((V+E)\log V)$, demostración de $\log E = O(\log V)$, grafos densos vs. dispersos, la trampa de la matriz y el análisis en lenguaje C. |
| **`04-recorrido-del-grafo-y-sandbox.html`** | **Parte 4** | **3. Laboratorio y Sandbox** | Guía para operar el Sandbox en vivo: dinámica de llenado/vaciado del heap, sobrescritura de `U`, formación del árbol SPT y manejo de grafos no conexos. |
| **`05-preguntas-del-profesor-y-teoria-greedy.html`** | **Parte 5** | **Preguntas de Examen** | Los 5 elementos Greedy formales (C-S-F-S-O), demostración de subestructura óptima y por contradicción, por qué no admite pesos negativos y banco de preguntas modelo. |

---

## 🚀 Cómo Correr la Aplicación (Paso a Paso en Bash)

Para ejecutar la plataforma interactiva durante la presentación, se requieren **dos terminales de Git Bash** (una para el Backend y otra para el Frontend):

### 1. Requisitos Previos (Backend)
El archivo `requirements.txt` contiene las dependencias del servidor. Debe mantenerse en el proyecto para que Python pueda instalar las librerías necesarias con un solo comando.

En la primera terminal, desde la raíz del repositorio:
```bash
# Instalar las librerías necesarias (solo la primera vez)
python -m pip install -r requirements.txt
```

### 2. Iniciar el Backend (FastAPI + Uvicorn)
En la misma terminal (raíz del repositorio):
```bash
python -m uvicorn backend.app:app --reload --port 8000
```
Verificás que levantó cuando veas:
`INFO: Uvicorn running on http://127.0.0.1:8000`

### 3. Iniciar el Frontend (React + Vite)
Abrí una segunda terminal de Git Bash, posicionate en `frontend` y levantá el servidor de desarrollo:
```bash
cd frontend
npm install   # Solo si no instalaste previamente los node_modules
npm run dev
```
Verificás que levantó cuando veas:
`➜ Local: http://localhost:5173/`

### 4. Abrir la Aplicación
Abrí tu navegador en:
👉 **`http://localhost:5173/`**

---

## 📄 El Archivo `dijkstra_tp.py`
En la raíz del proyecto se encuentra [`dijkstra_tp.py`](./dijkstra_tp.py). Es un script autocontenido de 69 líneas escrito en **Python puro**, sin dependencias de frameworks ni infraestructura web. Contiene la solución algorítmica limpia que cumple con los requerimientos académicos del trabajo práctico para ser leída o entregada de forma aislada.

---

## 🧪 Pruebas Automatizadas
Para verificar la corrección algorítmica de todas las variantes (equivalencia de costos mínimos, manejo de grafos dispersos, densos y no conexos), podés correr los tests unitarios con `pytest`:
```bash
pytest
```
Y para verificar el frontend:
```bash
cd frontend && npm test
```
