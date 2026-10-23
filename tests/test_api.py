from fastapi.testclient import TestClient
from backend.app import app


client = TestClient(app)


def test_endpoint_presets_devuelve_catalogo_de_grafos():
    respuesta = client.get("/api/dijkstra/presets")
    assert respuesta.status_code == 200
    datos = respuesta.json()
    assert len(datos["presets"]) >= 4
    primer_preset = datos["presets"][0]
    assert "id" in primer_preset
    assert "nombre" in primer_preset
    assert "cantidad_vertices" in primer_preset
    assert "aristas" in primer_preset


def test_endpoint_run_ejecuta_variantes_y_devuelve_traza_y_comparativa():
    carga = {
        "cantidad_vertices": 4,
        "aristas": [
            {"origen": 0, "destino": 1, "peso": 6},
            {"origen": 0, "destino": 2, "peso": 2},
            {"origen": 2, "destino": 1, "peso": 1},
            {"origen": 1, "destino": 3, "peso": 3},
        ],
        "variante": "cola_prioridad_optima",
        "modo_ciclo_interno": "adyacentes",
    }
    respuesta = client.post("/api/dijkstra/run", json=carga)
    assert respuesta.status_code == 200
    datos = respuesta.json()

    assert [n["costo"] for n in datos["estado_final"]] == [0, 3, 2, 6]
    assert [n["prev"] for n in datos["estado_final"]] == [0, 2, 0, 1]
    assert len(datos["pasos_construccion"]) == 8
    assert len(datos["pasos_algoritmo"]) > 0
    assert "comparativa_metricas" in datos
    assert "arreglo" in datos["comparativa_metricas"]
    assert "cola_prioridad_optima" in datos["comparativa_metricas"]
    assert "cola_prioridad_literal" in datos["comparativa_metricas"]


def test_endpoint_run_rechaza_peso_no_positivo():
    carga = {
        "cantidad_vertices": 2,
        "aristas": [{"origen": 0, "destino": 1, "peso": -5}],
        "variante": "cola_prioridad_optima",
        "modo_ciclo_interno": "adyacentes",
    }
    respuesta = client.post("/api/dijkstra/run", json=carga)
    assert respuesta.status_code == 400
