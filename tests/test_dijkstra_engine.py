import pytest
from backend.dijkstra_engine import (
    GrafoTDA,
    dijkstra_arreglo,
    dijkstra_cola_prioridad_literal,
    dijkstra_cola_prioridad_optima,
)


def construir_grafo_ejemplo_catedra() -> GrafoTDA:
    grafo = GrafoTDA()
    for _ in range(5):
        grafo.agregar_vertice_autoincremental()

    grafo.agregar_arista(0, 1, 10)
    grafo.agregar_arista(0, 3, 5)
    grafo.agregar_arista(1, 2, 1)
    grafo.agregar_arista(3, 1, 3)
    grafo.agregar_arista(3, 2, 9)
    grafo.agregar_arista(3, 4, 2)
    grafo.agregar_arista(4, 2, 6)
    return grafo


def test_dijkstra_cola_prioridad_optima_calcula_caminos_minimos_y_traza_construccion():
    grafo = construir_grafo_ejemplo_catedra()

    pasos_construccion = grafo.obtener_pasos_construccion()
    assert len(pasos_construccion) == 12
    ultimo_paso_construccion = pasos_construccion[-1]
    assert ultimo_paso_construccion["matriz_adyacencia"][0][1] == 10
    assert ultimo_paso_construccion["matriz_adyacencia"][3][1] == 3
    assert ultimo_paso_construccion["lista_adyacencia"][3] == [
        {"destino": 1, "peso": 3},
        {"destino": 2, "peso": 9},
        {"destino": 4, "peso": 2},
    ]

    resultado = dijkstra_cola_prioridad_optima(grafo)
    arreglo_final = resultado["estado_final"]

    assert [nodo["costo"] for nodo in arreglo_final] == [0, 8, 9, 5, 7]
    assert [nodo["prev"] for nodo in arreglo_final] == [0, 3, 1, 0, 3]
    assert [nodo["selec"] for nodo in arreglo_final] == [True, True, True, True, True]
    assert len(resultado["pasos_algoritmo"]) > 0


def test_grafo_rechaza_aristas_con_peso_no_positivo():
    grafo = GrafoTDA()
    grafo.agregar_vertice_autoincremental()
    grafo.agregar_vertice_autoincremental()

    with pytest.raises(ValueError, match="estrictamente positivo"):
        grafo.agregar_arista(0, 1, 0)

    with pytest.raises(ValueError, match="estrictamente positivo"):
        grafo.agregar_arista(0, 1, -4)


def test_todas_las_variantes_producen_mismo_resultado_en_grafo_conexo_y_no_conexo():
    grafo_conexo = construir_grafo_ejemplo_catedra()

    res_optima_ady = dijkstra_cola_prioridad_optima(grafo_conexo, modo_ciclo_interno="adyacentes")
    res_optima_mat = dijkstra_cola_prioridad_optima(grafo_conexo, modo_ciclo_interno="matriz")
    res_arreglo = dijkstra_arreglo(grafo_conexo)
    res_literal = dijkstra_cola_prioridad_literal(grafo_conexo)

    assert res_optima_ady["estado_final"] == res_optima_mat["estado_final"]
    assert res_optima_ady["estado_final"] == res_arreglo["estado_final"]
    assert res_optima_ady["estado_final"] == res_literal["estado_final"]

    assert res_optima_ady["metricas"]["inspecciones_aristas"] < res_arreglo["metricas"]["inspecciones_aristas"]
    assert res_literal["metricas"]["operaciones_cola_prioridad"] > res_optima_ady["metricas"]["operaciones_cola_prioridad"]

    grafo_no_conexo = GrafoTDA()
    for _ in range(4):
        grafo_no_conexo.agregar_vertice_autoincremental()
    grafo_no_conexo.agregar_arista(0, 1, 4)
    grafo_no_conexo.agregar_arista(2, 3, 2)

    res_nc_optima = dijkstra_cola_prioridad_optima(grafo_no_conexo)
    res_nc_arreglo = dijkstra_arreglo(grafo_no_conexo)
    res_nc_literal = dijkstra_cola_prioridad_literal(grafo_no_conexo)

    costos_esperados = [0, 4, None, None]
    assert [n["costo"] for n in res_nc_optima["estado_final"]] == costos_esperados
    assert [n["costo"] for n in res_nc_arreglo["estado_final"]] == costos_esperados
    assert [n["costo"] for n in res_nc_literal["estado_final"]] == costos_esperados


def test_lazy_deletion_descarta_entradas_obsoletas_en_tiempo_constante():
    grafo = GrafoTDA()
    for _ in range(4):
        grafo.agregar_vertice_autoincremental()

    grafo.agregar_arista(0, 3, 15)
    grafo.agregar_arista(0, 1, 2)
    grafo.agregar_arista(0, 2, 5)
    grafo.agregar_arista(1, 2, 1)
    grafo.agregar_arista(1, 3, 7)
    grafo.agregar_arista(2, 3, 3)

    resultado = dijkstra_cola_prioridad_optima(grafo)
    assert [n["costo"] for n in resultado["estado_final"]] == [0, 2, 3, 6]
    assert resultado["metricas"]["descartes_lazy_deletion"] >= 2
    eventos_descarte = [
        paso
        for paso in resultado["pasos_algoritmo"]
        if paso["descartado_por_lazy_deletion"]
    ]
    assert len(eventos_descarte) >= 2


def test_script_standalone_dijkstra_tp_recrea_estructura_catedra():
    from dijkstra_tp import Grafo, dijkstra

    grafo = Grafo(5)
    grafo.agregar_arista(0, 1, 10)
    grafo.agregar_arista(0, 3, 5)
    grafo.agregar_arista(1, 2, 1)
    grafo.agregar_arista(3, 1, 3)
    grafo.agregar_arista(3, 2, 9)
    grafo.agregar_arista(3, 4, 2)
    grafo.agregar_arista(4, 2, 6)

    arreglo_u = dijkstra(grafo)
    assert [nodo.costo for nodo in arreglo_u] == [0, 8, 9, 5, 7]
    assert [nodo.prev for nodo in arreglo_u] == [0, 3, 1, 0, 3]
    assert [nodo.selec for nodo in arreglo_u] == [True, True, True, True, True]


