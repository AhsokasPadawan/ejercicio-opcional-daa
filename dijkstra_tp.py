from dataclasses import dataclass
import heapq
import math


@dataclass
class Nodo:
    selec: bool = False
    costo: float = math.inf
    prev: int = 0


class Grafo:
    def __init__(self, cantidad_vertices: int) -> None:
        self._cantidad_vertices = cantidad_vertices
        self._adyacentes: list[list[tuple[int, float]]] = [
            [] for _ in range(cantidad_vertices)
        ]

    def vertices(self) -> int:
        return self._cantidad_vertices

    def agregar_arista(self, origen: int, destino: int, peso: float) -> None:
        if peso <= 0:
            raise ValueError("El peso de la arista debe ser positivo.")
        self._adyacentes[origen].append((destino, peso))

    def adyacentes(self, vertice: int) -> list[tuple[int, float]]:
        return self._adyacentes[vertice]


def crear_arreglo(grafo: Grafo) -> list[Nodo]:
    cantidad = grafo.vertices()
    arreglo = [Nodo(selec=False, costo=math.inf, prev=0) for _ in range(cantidad)]
    if cantidad > 0:
        arreglo[0].costo = 0
    return arreglo


def actualizar(
    grafo: Grafo,
    arreglo: list[Nodo],
    cola_prioridad: list[tuple[float, int]],
    vertice_actual: int,
) -> None:
    for vertice_vecino, peso_arista in grafo.adyacentes(vertice_actual):
        if not arreglo[vertice_vecino].selec:
            nuevo_costo = arreglo[vertice_actual].costo + peso_arista
            if nuevo_costo < arreglo[vertice_vecino].costo:
                arreglo[vertice_vecino].costo = nuevo_costo
                arreglo[vertice_vecino].prev = vertice_actual
                heapq.heappush(cola_prioridad, (nuevo_costo, vertice_vecino))


def dijkstra(grafo: Grafo) -> list[Nodo]:
    arreglo_u = crear_arreglo(grafo)
    cola_prioridad: list[tuple[float, int]] = []
    if grafo.vertices() > 0:
        heapq.heappush(cola_prioridad, (0, 0))

    while len(cola_prioridad) > 0:
        _, vertice_actual = heapq.heappop(cola_prioridad)
        if arreglo_u[vertice_actual].selec:
            continue
        arreglo_u[vertice_actual].selec = True
        actualizar(grafo, arreglo_u, cola_prioridad, vertice_actual)

    return arreglo_u
