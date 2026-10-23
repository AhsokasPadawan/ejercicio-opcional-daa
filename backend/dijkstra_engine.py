from dataclasses import dataclass
import heapq
import math
from typing import Any


@dataclass
class Nodo:
    selec: bool = False
    costo: float = math.inf
    prev: int = 0

    def a_diccionario(self, indice: int) -> dict[str, Any]:
        costo_serializado = None if math.isinf(self.costo) else self.costo
        return {
            "vertice": indice,
            "selec": self.selec,
            "costo": costo_serializado,
            "prev": self.prev,
        }


class ColaPrioridadTDA:
    def __init__(self) -> None:
        self._elementos: list[dict[str, Any]] = []

    def inicializar_cola(self) -> None:
        self._elementos = []

    def acolar_prioridad(self, vertice: int, costo: float, prev: int) -> None:
        indice_insercion = 0
        while (
            indice_insercion < len(self._elementos)
            and self._elementos[indice_insercion]["costo"] <= costo
        ):
            indice_insercion += 1
        self._elementos.insert(
            indice_insercion,
            {"vertice": vertice, "costo": costo, "prev": prev},
        )

    def desacolar(self) -> None:
        if len(self._elementos) > 0:
            self._elementos.pop(0)

    def primero(self) -> dict[str, Any]:
        return dict(self._elementos[0])

    def prioridad(self) -> float:
        return float(self._elementos[0]["costo"])

    def cola_vacia(self) -> bool:
        return len(self._elementos) == 0

    def instantanea(self) -> list[dict[str, Any]]:
        return [
            {
                "vertice": item["vertice"],
                "costo": None if math.isinf(item["costo"]) else item["costo"],
                "prev": item["prev"],
            }
            for item in self._elementos
        ]


class GrafoTDA:
    def __init__(self) -> None:
        self._cantidad_vertices = 0
        self._pesos_aristas: dict[tuple[int, int], int | float] = {}
        self._lista_adyacencia: dict[int, list[dict[str, int | float]]] = {}
        self._pasos_construccion: list[dict[str, Any]] = []

    def vertices(self) -> int:
        return self._cantidad_vertices

    def agregar_vertice_autoincremental(self) -> int:
        nuevo_vertice = self._cantidad_vertices
        self._cantidad_vertices += 1
        self._lista_adyacencia[nuevo_vertice] = []
        self._registrar_paso_construccion(
            accion="agregar_vertice",
            descripcion=f"Se agrega el vértice {nuevo_vertice} al grafo.",
            vertice=nuevo_vertice,
        )
        return nuevo_vertice

    def agregar_arista(self, origen: int, destino: int, peso: int | float) -> None:
        self._validar_vertice(origen)
        self._validar_vertice(destino)
        if peso <= 0:
            raise ValueError("El peso de la arista debe ser estrictamente positivo.")

        self._pesos_aristas[(origen, destino)] = peso
        vecinos_actuales = [
            vecino
            for vecino in self._lista_adyacencia[origen]
            if vecino["destino"] != destino
        ]
        vecinos_actuales.append({"destino": destino, "peso": peso})
        vecinos_actuales.sort(key=lambda item: int(item["destino"]))
        self._lista_adyacencia[origen] = vecinos_actuales

        self._registrar_paso_construccion(
            accion="agregar_arista",
            descripcion=f"Se agrega la arista dirigida ({origen} -> {destino}) con peso {peso}.",
            arista={"origen": origen, "destino": destino, "peso": peso},
        )

    def existe_arista(self, origen: int, destino: int) -> bool:
        return (origen, destino) in self._pesos_aristas

    def peso_arista(self, origen: int, destino: int) -> int | float:
        return self._pesos_aristas[(origen, destino)]

    def adyacentes(self, origen: int) -> list[dict[str, int | float]]:
        self._validar_vertice(origen)
        return [dict(vecino) for vecino in self._lista_adyacencia[origen]]

    def obtener_matriz_adyacencia(self) -> list[list[int | float | None]]:
        matriz: list[list[int | float | None]] = []
        for fila in range(self._cantidad_vertices):
            valores_fila: list[int | float | None] = []
            for columna in range(self._cantidad_vertices):
                peso = self._pesos_aristas.get((fila, columna))
                valores_fila.append(peso)
            matriz.append(valores_fila)
        return matriz

    def obtener_lista_adyacencia(self) -> dict[int, list[dict[str, int | float]]]:
        return {
            vertice: [dict(vecino) for vecino in vecinos]
            for vertice, vecinos in self._lista_adyacencia.items()
        }

    def obtener_pasos_construccion(self) -> list[dict[str, Any]]:
        return list(self._pasos_construccion)

    def _validar_vertice(self, vertice: int) -> None:
        if vertice < 0 or vertice >= self._cantidad_vertices:
            raise ValueError(f"El vértice {vertice} no existe en el grafo.")

    def _registrar_paso_construccion(
        self,
        accion: str,
        descripcion: str,
        vertice: int | None = None,
        arista: dict[str, int | float] | None = None,
    ) -> None:
        self._pasos_construccion.append(
            {
                "paso": len(self._pasos_construccion) + 1,
                "accion": accion,
                "descripcion": descripcion,
                "vertice": vertice,
                "arista": arista,
                "matriz_adyacencia": self.obtener_matriz_adyacencia(),
                "lista_adyacencia": self.obtener_lista_adyacencia(),
            }
        )


def crear_arreglo_catedra(grafo: GrafoTDA) -> list[Nodo]:
    cantidad_vertices = grafo.vertices()
    arreglo: list[Nodo] = []
    for indice in range(cantidad_vertices):
        nodo = Nodo(selec=False, costo=math.inf, prev=0)
        if indice == 0:
            nodo.selec = True
            nodo.costo = 0
        else:
            if grafo.existe_arista(0, indice):
                nodo.costo = grafo.peso_arista(0, indice)
            else:
                nodo.costo = math.inf
        arreglo.append(nodo)
    return arreglo


def completo_catedra(arreglo: list[Nodo]) -> tuple[bool, int]:
    listo = True
    comparaciones = 0
    for nodo in arreglo:
        comparaciones += 1
        listo = listo and nodo.selec
    return listo, comparaciones


def buscar_minimo_catedra(arreglo: list[Nodo]) -> tuple[int | None, int]:
    minimo = math.inf
    indice_minimo: int | None = None
    comparaciones = 0
    for indice, nodo in enumerate(arreglo):
        comparaciones += 1
        if not nodo.selec and nodo.costo < minimo:
            minimo = nodo.costo
            indice_minimo = indice
    return indice_minimo, comparaciones


def crear_arreglo_inicial_cola_prioridad(grafo: GrafoTDA) -> list[Nodo]:
    cantidad_vertices = grafo.vertices()
    arreglo = [Nodo(selec=False, costo=math.inf, prev=0) for _ in range(cantidad_vertices)]
    if cantidad_vertices > 0:
        arreglo[0].costo = 0
    return arreglo


def serializar_arreglo_estado(arreglo: list[Nodo]) -> list[dict[str, Any]]:
    return [nodo.a_diccionario(indice) for indice, nodo in enumerate(arreglo)]


def serializar_cola_prioridad(cola: list[tuple[int | float, int]]) -> list[dict[str, Any]]:
    return [
        {"costo": None if math.isinf(costo) else costo, "vertice": vertice}
        for costo, vertice in sorted(cola)
    ]


def dijkstra_arreglo(grafo: GrafoTDA) -> dict[str, Any]:
    arreglo_estado = crear_arreglo_catedra(grafo)
    pasos_algoritmo: list[dict[str, Any]] = []

    selecciones_minimo = 0
    comparaciones_busqueda_minimo = 0
    inspecciones_aristas = max(0, grafo.vertices() - 1)
    relajaciones = 0

    pasos_algoritmo.append(
        {
            "paso": 1,
            "evento": "inicializacion",
            "descripcion": "crearArreglo(G): el nodo 0 inicia seleccionado (costo 0) y sus vecinos directos toman el peso de la arista (0, i).",
            "vertice_actual": 0 if grafo.vertices() > 0 else None,
            "arista_evaluada": None,
            "relajada": False,
            "descartado_por_lazy_deletion": False,
            "estado_arreglo": serializar_arreglo_estado(arreglo_estado),
            "cola_prioridad": [],
        }
    )

    while True:
        esta_completo, comp_completo = completo_catedra(arreglo_estado)
        comparaciones_busqueda_minimo += comp_completo
        if esta_completo:
            break

        indice_minimo, comp_minimo = buscar_minimo_catedra(arreglo_estado)
        comparaciones_busqueda_minimo += comp_minimo
        if indice_minimo is None:
            break

        selecciones_minimo += 1
        arreglo_estado[indice_minimo].selec = True
        pasos_algoritmo.append(
            {
                "paso": len(pasos_algoritmo) + 1,
                "evento": "seleccion_vertice",
                "descripcion": f"buscarMinimo(U) recorre los {grafo.vertices()} elementos y selecciona el vértice {indice_minimo} con costo {arreglo_estado[indice_minimo].costo}.",
                "vertice_actual": indice_minimo,
                "arista_evaluada": None,
                "relajada": False,
                "descartado_por_lazy_deletion": False,
                "estado_arreglo": serializar_arreglo_estado(arreglo_estado),
                "cola_prioridad": [],
            }
        )

        for destino in range(grafo.vertices()):
            inspecciones_aristas += 1
            if not arreglo_estado[destino].selec and grafo.existe_arista(indice_minimo, destino):
                peso = grafo.peso_arista(indice_minimo, destino)
                nuevo_costo = arreglo_estado[indice_minimo].costo + peso
                mejora_camino = nuevo_costo < arreglo_estado[destino].costo
                if mejora_camino:
                    arreglo_estado[destino].costo = nuevo_costo
                    arreglo_estado[destino].prev = indice_minimo
                    relajaciones += 1

                pasos_algoritmo.append(
                    {
                        "paso": len(pasos_algoritmo) + 1,
                        "evento": "evaluacion_arista",
                        "descripcion": (
                            f"actualizar: la arista ({indice_minimo} -> {destino}) mejora el costo a {nuevo_costo}; se actualiza U[{destino}]."
                            if mejora_camino
                            else f"actualizar: la arista ({indice_minimo} -> {destino}) con costo {nuevo_costo} no mejora U[{destino}].costo ({arreglo_estado[destino].costo})."
                        ),
                        "vertice_actual": indice_minimo,
                        "arista_evaluada": {
                            "origen": indice_minimo,
                            "destino": destino,
                            "peso": peso,
                        },
                        "relajada": mejora_camino,
                        "descartado_por_lazy_deletion": False,
                        "estado_arreglo": serializar_arreglo_estado(arreglo_estado),
                        "cola_prioridad": [],
                    }
                )

    metricas = {
        "selecciones_minimo": selecciones_minimo,
        "comparaciones_busqueda_minimo": comparaciones_busqueda_minimo,
        "inspecciones_aristas": inspecciones_aristas,
        "relajaciones": relajaciones,
        "operaciones_cola_prioridad": 0,
        "descartes_lazy_deletion": 0,
        "total_operaciones_elementales": (
            comparaciones_busqueda_minimo + inspecciones_aristas + relajaciones
        ),
    }

    return {
        "estado_final": serializar_arreglo_estado(arreglo_estado),
        "pasos_algoritmo": pasos_algoritmo,
        "metricas": metricas,
    }


def dijkstra_cola_prioridad_optima(
    grafo: GrafoTDA,
    modo_ciclo_interno: str = "adyacentes",
) -> dict[str, Any]:
    arreglo_estado = crear_arreglo_inicial_cola_prioridad(grafo)
    cola_prioridad: list[tuple[int | float, int]] = []
    pasos_algoritmo: list[dict[str, Any]] = []

    selecciones_minimo = 0
    inspecciones_aristas = 0
    relajaciones = 0
    operaciones_cola_prioridad = 0
    descartes_lazy_deletion = 0

    if grafo.vertices() > 0:
        heapq.heappush(cola_prioridad, (0, 0))
        operaciones_cola_prioridad += 1

    pasos_algoritmo.append(
        {
            "paso": 1,
            "evento": "inicializacion",
            "descripcion": "Se inicializa el arreglo U con costo infinito (origen 0 en 0) y se encola (0, 0) en la Cola de Prioridad Q.",
            "vertice_actual": None,
            "arista_evaluada": None,
            "relajada": False,
            "descartado_por_lazy_deletion": False,
            "estado_arreglo": serializar_arreglo_estado(arreglo_estado),
            "cola_prioridad": serializar_cola_prioridad(cola_prioridad),
        }
    )

    while len(cola_prioridad) > 0:
        costo_extraido, vertice_actual = heapq.heappop(cola_prioridad)
        operaciones_cola_prioridad += 1

        if arreglo_estado[vertice_actual].selec:
            descartes_lazy_deletion += 1
            pasos_algoritmo.append(
                {
                    "paso": len(pasos_algoritmo) + 1,
                    "evento": "descarte_lazy_deletion",
                    "descripcion": f"Se desencola el vértice {vertice_actual} con costo obsoleto {costo_extraido} y se descarta en O(1) porque U[{vertice_actual}].selec es true.",
                    "vertice_actual": vertice_actual,
                    "arista_evaluada": None,
                    "relajada": False,
                    "descartado_por_lazy_deletion": True,
                    "estado_arreglo": serializar_arreglo_estado(arreglo_estado),
                    "cola_prioridad": serializar_cola_prioridad(cola_prioridad),
                }
            )
            continue

        selecciones_minimo += 1
        arreglo_estado[vertice_actual].selec = True
        pasos_algoritmo.append(
            {
                "paso": len(pasos_algoritmo) + 1,
                "evento": "seleccion_vertice",
                "descripcion": f"Se desencola el vértice {vertice_actual} con costo mínimo {costo_extraido} en O(log V) y se marca U[{vertice_actual}].selec = true.",
                "vertice_actual": vertice_actual,
                "arista_evaluada": None,
                "relajada": False,
                "descartado_por_lazy_deletion": False,
                "estado_arreglo": serializar_arreglo_estado(arreglo_estado),
                "cola_prioridad": serializar_cola_prioridad(cola_prioridad),
            }
        )

        if modo_ciclo_interno == "matriz":
            candidatos_vecinos: list[dict[str, int | float]] = []
            for posible_destino in range(grafo.vertices()):
                inspecciones_aristas += 1
                if not arreglo_estado[posible_destino].selec and grafo.existe_arista(
                    vertice_actual, posible_destino
                ):
                    candidatos_vecinos.append(
                        {
                            "destino": posible_destino,
                            "peso": grafo.peso_arista(vertice_actual, posible_destino),
                        }
                    )
        else:
            vecinos_adyacentes = grafo.adyacentes(vertice_actual)
            inspecciones_aristas += len(vecinos_adyacentes)
            candidatos_vecinos = [
                vecino
                for vecino in vecinos_adyacentes
                if not arreglo_estado[int(vecino["destino"])].selec
            ]

        for vecino in candidatos_vecinos:
            vertice_destino = int(vecino["destino"])
            peso_arista = vecino["peso"]

            nuevo_costo = arreglo_estado[vertice_actual].costo + peso_arista
            mejora_camino = nuevo_costo < arreglo_estado[vertice_destino].costo
            if mejora_camino:
                arreglo_estado[vertice_destino].costo = nuevo_costo
                arreglo_estado[vertice_destino].prev = vertice_actual
                heapq.heappush(cola_prioridad, (nuevo_costo, vertice_destino))
                relajaciones += 1
                operaciones_cola_prioridad += 1

            pasos_algoritmo.append(
                {
                    "paso": len(pasos_algoritmo) + 1,
                    "evento": "evaluacion_arista",
                    "descripcion": (
                        f"La arista ({vertice_actual} -> {vertice_destino}) mejora el costo a {nuevo_costo}; se actualiza U[{vertice_destino}] en O(1) y se encola ({nuevo_costo}, {vertice_destino}) en O(log V)."
                        if mejora_camino
                        else f"La arista ({vertice_actual} -> {vertice_destino}) con costo acumulado {nuevo_costo} no mejora U[{vertice_destino}].costo ({arreglo_estado[vertice_destino].costo})."
                    ),
                    "vertice_actual": vertice_actual,
                    "arista_evaluada": {
                        "origen": vertice_actual,
                        "destino": vertice_destino,
                        "peso": peso_arista,
                    },
                    "relajada": mejora_camino,
                    "descartado_por_lazy_deletion": False,
                    "estado_arreglo": serializar_arreglo_estado(arreglo_estado),
                    "cola_prioridad": serializar_cola_prioridad(cola_prioridad),
                }
            )

    metricas = {
        "selecciones_minimo": selecciones_minimo,
        "comparaciones_busqueda_minimo": 0,
        "inspecciones_aristas": inspecciones_aristas,
        "relajaciones": relajaciones,
        "operaciones_cola_prioridad": operaciones_cola_prioridad,
        "descartes_lazy_deletion": descartes_lazy_deletion,
        "total_operaciones_elementales": (
            inspecciones_aristas + relajaciones + operaciones_cola_prioridad
        ),
    }

    return {
        "estado_final": serializar_arreglo_estado(arreglo_estado),
        "pasos_algoritmo": pasos_algoritmo,
        "metricas": metricas,
    }


def reconstruir_estado_desde_cola_literal(
    cantidad_vertices: int,
    confirmados: dict[int, dict[str, Any]],
    cola: ColaPrioridadTDA,
) -> list[dict[str, Any]]:
    mapa_pendientes = {item["vertice"]: item for item in cola.instantanea()}
    resultado: list[dict[str, Any]] = []
    for vertice in range(cantidad_vertices):
        if vertice in confirmados:
            resultado.append(dict(confirmados[vertice]))
        elif vertice in mapa_pendientes:
            pendiente = mapa_pendientes[vertice]
            resultado.append(
                {
                    "vertice": vertice,
                    "selec": False,
                    "costo": pendiente["costo"],
                    "prev": pendiente["prev"],
                }
            )
        else:
            resultado.append(
                {"vertice": vertice, "selec": False, "costo": None, "prev": 0}
            )
    return resultado


def dijkstra_cola_prioridad_literal(grafo: GrafoTDA) -> dict[str, Any]:
    cola_pendientes = ColaPrioridadTDA()
    cola_pendientes.inicializar_cola()
    confirmados: dict[int, dict[str, Any]] = {}
    pasos_algoritmo: list[dict[str, Any]] = []

    selecciones_minimo = 0
    inspecciones_aristas = 0
    relajaciones = 0
    operaciones_cola_prioridad = 0

    for vertice in range(grafo.vertices()):
        costo_inicial = 0.0 if vertice == 0 else math.inf
        cola_pendientes.acolar_prioridad(vertice, costo_inicial, 0)
        operaciones_cola_prioridad += 1

    pasos_algoritmo.append(
        {
            "paso": 1,
            "evento": "inicializacion",
            "descripcion": "Reemplazo literal de U por ColaPrioridadTDA Q: se encolan todos los vértices (origen 0 con prioridad 0 y el resto con infinito).",
            "vertice_actual": None,
            "arista_evaluada": None,
            "relajada": False,
            "descartado_por_lazy_deletion": False,
            "estado_arreglo": reconstruir_estado_desde_cola_literal(
                grafo.vertices(), confirmados, cola_pendientes
            ),
            "cola_prioridad": [
                {"vertice": item["vertice"], "costo": item["costo"]}
                for item in cola_pendientes.instantanea()
            ],
        }
    )

    while not cola_pendientes.cola_vacia():
        actual = cola_pendientes.primero()
        costo_actual = cola_pendientes.prioridad()
        cola_pendientes.desacolar()
        operaciones_cola_prioridad += 1

        vertice_actual = int(actual["vertice"])
        if math.isinf(costo_actual):
            confirmados[vertice_actual] = {
                "vertice": vertice_actual,
                "selec": False,
                "costo": None,
                "prev": int(actual["prev"]),
            }
            continue

        selecciones_minimo += 1
        confirmados[vertice_actual] = {
            "vertice": vertice_actual,
            "selec": True,
            "costo": costo_actual,
            "prev": int(actual["prev"]),
        }

        pasos_algoritmo.append(
            {
                "paso": len(pasos_algoritmo) + 1,
                "evento": "seleccion_vertice",
                "descripcion": f"Se extrae de Q el vértice {vertice_actual} con costo {costo_actual}. Al no existir el arreglo U, para actualizar vecinos habrá que desencolar y reencolar Q.",
                "vertice_actual": vertice_actual,
                "arista_evaluada": None,
                "relajada": False,
                "descartado_por_lazy_deletion": False,
                "estado_arreglo": reconstruir_estado_desde_cola_literal(
                    grafo.vertices(), confirmados, cola_pendientes
                ),
                "cola_prioridad": [
                    {"vertice": item["vertice"], "costo": item["costo"]}
                    for item in cola_pendientes.instantanea()
                ],
            }
        )

        cola_auxiliar = ColaPrioridadTDA()
        cola_auxiliar.inicializar_cola()

        while not cola_pendientes.cola_vacia():
            candidato = cola_pendientes.primero()
            costo_candidato = cola_pendientes.prioridad()
            cola_pendientes.desacolar()
            operaciones_cola_prioridad += 1

            vertice_destino = int(candidato["vertice"])
            prev_candidato = int(candidato["prev"])

            inspecciones_aristas += 1
            if grafo.existe_arista(vertice_actual, vertice_destino):
                peso = grafo.peso_arista(vertice_actual, vertice_destino)
                nuevo_costo = costo_actual + peso
                mejora_camino = nuevo_costo < costo_candidato
                if mejora_camino:
                    costo_candidato = nuevo_costo
                    prev_candidato = vertice_actual
                    relajaciones += 1

                cola_auxiliar.acolar_prioridad(
                    vertice_destino, costo_candidato, prev_candidato
                )
                operaciones_cola_prioridad += 1

                elementos_combinados = sorted(
                    cola_auxiliar.instantanea() + cola_pendientes.instantanea(),
                    key=lambda item: (
                        math.inf if item["costo"] is None else float(item["costo"]),
                        int(item["vertice"]),
                    ),
                )
                mapa_combinado = {
                    int(item["vertice"]): item for item in elementos_combinados
                }
                estado_combinado = [
                    dict(confirmados[v])
                    if v in confirmados
                    else {
                        "vertice": v,
                        "selec": False,
                        "costo": mapa_combinado[v]["costo"] if v in mapa_combinado else None,
                        "prev": mapa_combinado[v]["prev"] if v in mapa_combinado else 0,
                    }
                    for v in range(grafo.vertices())
                ]

                pasos_algoritmo.append(
                    {
                        "paso": len(pasos_algoritmo) + 1,
                        "evento": "evaluacion_arista",
                        "descripcion": (
                            f"Sin arreglo U: se desencola {vertice_destino} de Q, se mejora su costo a {nuevo_costo} y se reencola en Q_aux."
                            if mejora_camino
                            else f"Sin arreglo U: se desencola {vertice_destino} de Q, no mejora su costo y se reencola en Q_aux."
                        ),
                        "vertice_actual": vertice_actual,
                        "arista_evaluada": {
                            "origen": vertice_actual,
                            "destino": vertice_destino,
                            "peso": peso,
                        },
                        "relajada": mejora_camino,
                        "descartado_por_lazy_deletion": False,
                        "estado_arreglo": estado_combinado,
                        "cola_prioridad": [
                            {"vertice": item["vertice"], "costo": item["costo"]}
                            for item in elementos_combinados
                        ],
                    }
                )
            else:
                cola_auxiliar.acolar_prioridad(
                    vertice_destino, costo_candidato, prev_candidato
                )
                operaciones_cola_prioridad += 1

        while not cola_auxiliar.cola_vacia():
            elemento = cola_auxiliar.primero()
            prioridad_elem = cola_auxiliar.prioridad()
            cola_auxiliar.desacolar()
            cola_pendientes.acolar_prioridad(
                int(elemento["vertice"]),
                prioridad_elem,
                int(elemento["prev"]),
            )
            operaciones_cola_prioridad += 2

    estado_final = reconstruir_estado_desde_cola_literal(
        grafo.vertices(), confirmados, cola_pendientes
    )

    metricas = {
        "selecciones_minimo": selecciones_minimo,
        "comparaciones_busqueda_minimo": 0,
        "inspecciones_aristas": inspecciones_aristas,
        "relajaciones": relajaciones,
        "operaciones_cola_prioridad": operaciones_cola_prioridad,
        "descartes_lazy_deletion": 0,
        "total_operaciones_elementales": (
            inspecciones_aristas + relajaciones + operaciones_cola_prioridad
        ),
    }

    return {
        "estado_final": estado_final,
        "pasos_algoritmo": pasos_algoritmo,
        "metricas": metricas,
    }
