from typing import Any, Literal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.dijkstra_engine import (
    GrafoTDA,
    dijkstra_arreglo,
    dijkstra_cola_prioridad_literal,
    dijkstra_cola_prioridad_optima,
)


app = FastAPI(title="TP Optativo 1 - Algoritmo de Dijkstra API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AristaEntrada(BaseModel):
    origen: int = Field(ge=0)
    destino: int = Field(ge=0)
    peso: float


class SolicitudEjecucionDijkstra(BaseModel):
    cantidad_vertices: int = Field(ge=1, le=50)
    aristas: list[AristaEntrada]
    variante: Literal[
        "cola_prioridad_optima",
        "cola_prioridad_literal",
        "arreglo",
    ] = "cola_prioridad_optima"
    modo_ciclo_interno: Literal["adyacentes", "matriz"] = "adyacentes"


PRESETS_GRAFOS: list[dict[str, Any]] = [
    {
        "id": "catedra_clasico",
        "nombre": "Grafo Clásico de Cátedra (5 vértices)",
        "descripcion": "Caminos indirectos (0 -> 3 -> 1 -> 2) mejoran a las aristas directas iniciales.",
        "cantidad_vertices": 5,
        "nodos_posiciones": [
            {"id": 0, "x": 110, "y": 190},
            {"id": 1, "x": 310, "y": 85},
            {"id": 2, "x": 540, "y": 95},
            {"id": 3, "x": 310, "y": 295},
            {"id": 4, "x": 540, "y": 295},
        ],
        "aristas": [
            {"origen": 0, "destino": 1, "peso": 10},
            {"origen": 0, "destino": 3, "peso": 5},
            {"origen": 1, "destino": 2, "peso": 1},
            {"origen": 3, "destino": 1, "peso": 3},
            {"origen": 3, "destino": 2, "peso": 9},
            {"origen": 3, "destino": 4, "peso": 2},
            {"origen": 4, "destino": 2, "peso": 6},
        ],
    },
    {
        "id": "lazy_deletion_demo",
        "nombre": "Demostración de Lazy Deletion (Múltiples Relajaciones)",
        "descripcion": "El vértice 3 se encola tres veces con costos decrecientes (15, 9 y 6), mostrando el descarte perezoso en O(1).",
        "cantidad_vertices": 4,
        "nodos_posiciones": [
            {"id": 0, "x": 110, "y": 190},
            {"id": 1, "x": 310, "y": 80},
            {"id": 2, "x": 310, "y": 300},
            {"id": 3, "x": 530, "y": 190},
        ],
        "aristas": [
            {"origen": 0, "destino": 3, "peso": 15},
            {"origen": 0, "destino": 1, "peso": 2},
            {"origen": 0, "destino": 2, "peso": 5},
            {"origen": 1, "destino": 2, "peso": 1},
            {"origen": 1, "destino": 3, "peso": 7},
            {"origen": 2, "destino": 3, "peso": 3},
        ],
    },
    {
        "id": "grafo_disperso",
        "nombre": "Grafo Disperso (E << V²)",
        "descripcion": "Red de 7 vértices con pocas conexiones donde la Cola de Prioridad con Lista de Adyacencia realiza muchas menos operaciones.",
        "cantidad_vertices": 7,
        "nodos_posiciones": [
            {"id": 0, "x": 85, "y": 190},
            {"id": 1, "x": 220, "y": 85},
            {"id": 2, "x": 220, "y": 295},
            {"id": 3, "x": 370, "y": 85},
            {"id": 4, "x": 370, "y": 295},
            {"id": 5, "x": 510, "y": 140},
            {"id": 6, "x": 610, "y": 240},
        ],
        "aristas": [
            {"origen": 0, "destino": 1, "peso": 4},
            {"origen": 0, "destino": 2, "peso": 2},
            {"origen": 2, "destino": 1, "peso": 1},
            {"origen": 1, "destino": 3, "peso": 5},
            {"origen": 2, "destino": 4, "peso": 8},
            {"origen": 3, "destino": 5, "peso": 2},
            {"origen": 4, "destino": 5, "peso": 1},
            {"origen": 5, "destino": 6, "peso": 3},
        ],
    },
    {
        "id": "grafo_no_conexo",
        "nombre": "Grafo No Conexo (Vértices Inalcanzables ∞)",
        "descripcion": "Demuestra que el grafo no necesita ser conexo: los vértices 4 y 5 quedan con costo infinito.",
        "cantidad_vertices": 6,
        "nodos_posiciones": [
            {"id": 0, "x": 110, "y": 130},
            {"id": 1, "x": 280, "y": 75},
            {"id": 2, "x": 280, "y": 210},
            {"id": 3, "x": 430, "y": 140},
            {"id": 4, "x": 530, "y": 285},
            {"id": 5, "x": 635, "y": 285},
        ],
        "aristas": [
            {"origen": 0, "destino": 1, "peso": 6},
            {"origen": 0, "destino": 2, "peso": 2},
            {"origen": 2, "destino": 1, "peso": 2},
            {"origen": 1, "destino": 3, "peso": 1},
            {"origen": 4, "destino": 5, "peso": 3},
        ],
    },
    {
        "id": "grafo_denso",
        "nombre": "Grafo Denso (E ≈ V²)",
        "descripcion": "Grafo fuertemente interconectado donde casi todos los pares de vértices tienen aristas dirigidas.",
        "cantidad_vertices": 5,
        "nodos_posiciones": [
            {"id": 0, "x": 110, "y": 190},
            {"id": 1, "x": 270, "y": 70},
            {"id": 2, "x": 500, "y": 90},
            {"id": 3, "x": 270, "y": 310},
            {"id": 4, "x": 500, "y": 290},
        ],
        "aristas": [
            {"origen": 0, "destino": 1, "peso": 9},
            {"origen": 0, "destino": 2, "peso": 14},
            {"origen": 0, "destino": 3, "peso": 4},
            {"origen": 0, "destino": 4, "peso": 11},
            {"origen": 3, "destino": 1, "peso": 3},
            {"origen": 3, "destino": 2, "peso": 8},
            {"origen": 3, "destino": 4, "peso": 5},
            {"origen": 1, "destino": 2, "peso": 2},
            {"origen": 1, "destino": 4, "peso": 1},
            {"origen": 4, "destino": 2, "peso": 1},
        ],
    },
]


def construir_grafo_desde_solicitud(solicitud: SolicitudEjecucionDijkstra) -> GrafoTDA:
    grafo = GrafoTDA()
    for _ in range(solicitud.cantidad_vertices):
        grafo.agregar_vertice_autoincremental()
    for arista in solicitud.aristas:
        grafo.agregar_arista(arista.origen, arista.destino, arista.peso)
    return grafo


@app.get("/api/dijkstra/presets")
def obtener_presets() -> dict[str, Any]:
    return {"presets": PRESETS_GRAFOS}


@app.post("/api/dijkstra/run")
def ejecutar_dijkstra(solicitud: SolicitudEjecucionDijkstra) -> dict[str, Any]:
    try:
        grafo = construir_grafo_desde_solicitud(solicitud)
    except ValueError as error_validacion:
        raise HTTPException(status_code=400, detail=str(error_validacion)) from error_validacion

    resultado_optima_adyacentes = dijkstra_cola_prioridad_optima(
        grafo, modo_ciclo_interno="adyacentes"
    )
    resultado_optima_matriz = dijkstra_cola_prioridad_optima(
        grafo, modo_ciclo_interno="matriz"
    )
    resultado_arreglo = dijkstra_arreglo(grafo)
    resultado_literal = dijkstra_cola_prioridad_literal(grafo)

    mapa_resultados = {
        ("cola_prioridad_optima", "adyacentes"): resultado_optima_adyacentes,
        ("cola_prioridad_optima", "matriz"): resultado_optima_matriz,
        ("cola_prioridad_literal", "adyacentes"): resultado_literal,
        ("cola_prioridad_literal", "matriz"): resultado_literal,
        ("arreglo", "adyacentes"): resultado_arreglo,
        ("arreglo", "matriz"): resultado_arreglo,
    }

    seleccionado = mapa_resultados[(solicitud.variante, solicitud.modo_ciclo_interno)]

    return {
        "variante_ejecutada": solicitud.variante,
        "modo_ciclo_interno": solicitud.modo_ciclo_interno,
        "pasos_construccion": grafo.obtener_pasos_construccion(),
        "pasos_algoritmo": seleccionado["pasos_algoritmo"],
        "estado_final": seleccionado["estado_final"],
        "metricas": seleccionado["metricas"],
        "comparativa_metricas": {
            "arreglo": resultado_arreglo["metricas"],
            "cola_prioridad_optima": resultado_optima_adyacentes["metricas"],
            "cola_prioridad_matriz": resultado_optima_matriz["metricas"],
            "cola_prioridad_literal": resultado_literal["metricas"],
        },
    }
