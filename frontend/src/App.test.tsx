import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("Aplicación de Presentación TP Optativo 1 - Dijkstra", () => {
  it("muestra las 3 versiones en paralelo con la misma cantidad de líneas alineadas horizontalmente y permite cambiar a Python", async () => {
    const usuario = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /Comparativa de Algoritmos: Arreglo U vs\. Cola de Prioridad/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/1\. Con Arreglo U/i)).toBeInTheDocument();
    expect(
      screen.getByText(/2\. Cola de Prioridad \+ Arreglo U/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/3\. Cola de Prioridad sin Arreglo/i)
    ).toBeInTheDocument();

    const tarjetasColumna = document.querySelectorAll(".tarjeta-codigo");
    expect(tarjetasColumna.length).toBe(3);

    const cardsCol1 = tarjetasColumna[0].querySelectorAll(".card-funcion-codigo code");
    const cardsCol2 = tarjetasColumna[1].querySelectorAll(".card-funcion-codigo code");
    const cardsCol3 = tarjetasColumna[2].querySelectorAll(".card-funcion-codigo code");
    expect(cardsCol1.length).toBe(5);
    expect(cardsCol2.length).toBe(5);
    expect(cardsCol3.length).toBe(5);

    cardsCol1.forEach((card, indice) => {
      const lineas1 = card.textContent?.split("\n").length;
      const lineas2 = cardsCol2[indice].textContent?.split("\n").length;
      const lineas3 = cardsCol3[indice].textContent?.split("\n").length;
      expect(lineas1).toBe(lineas2);
      expect(lineas2).toBe(lineas3);
    });

    const botonPython = screen.getByRole("button", { name: /Código Python/i });
    await usuario.click(botonPython);

    expect(screen.getAllByText(/def dijkstra/i).length).toBeGreaterThan(0);
  });

  it("navega a la vista de Análisis de Complejidad mediante la Lookup Table y muestra el desglose asintótico", async () => {
    const usuario = userEvent.setup();
    render(<App />);

    const pestanaComplejidad = screen.getByRole("button", {
      name: /2\. Análisis de Complejidad/i,
    });
    await usuario.click(pestanaComplejidad);

    expect(
      screen.getByRole("heading", {
        name: /Cálculo y Comparación de Complejidad Temporal/i,
      })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/O\(\(V \+ E\) log V\)/i).length).toBeGreaterThan(0);
  });

  it("inicializa el Sandbox vacío en 'Crear grafo', crea aristas con peso 1 por defecto editable al clickear y permite borrarlas con la X roja", async () => {
    const usuario = userEvent.setup();

    const respuestaSimulada = {
      variante_ejecutada: "cola_prioridad_optima",
      modo_ciclo_interno: "adyacentes",
      pasos_construccion: [
        {
          paso: 1,
          accion: "agregar_vertice",
          descripcion: "Se agrega el vértice 0 al grafo.",
          vertice: 0,
          arista: null,
          matriz_adyacencia: [[null]],
          lista_adyacencia: { "0": [] },
        },
      ],
      pasos_algoritmo: [
        {
          paso: 1,
          evento: "inicializacion",
          descripcion: "Inicialización del algoritmo.",
          vertice_actual: 0,
          arista_evaluada: null,
          relajada: false,
          descartado_por_lazy_deletion: false,
          estado_arreglo: [{ vertice: 0, selec: true, costo: 0, prev: 0 }],
          cola_prioridad: [],
        },
      ],
      estado_final: [{ vertice: 0, selec: true, costo: 0, prev: 0 }],
      metricas: {
        selecciones_minimo: 1,
        comparaciones_busqueda_minimo: 0,
        inspecciones_aristas: 0,
        relajaciones: 0,
        operaciones_cola_prioridad: 2,
        descartes_lazy_deletion: 0,
        total_operaciones_elementales: 2,
      },
      comparativa_metricas: {
        arreglo: {
          selecciones_minimo: 1,
          comparaciones_busqueda_minimo: 2,
          inspecciones_aristas: 1,
          relajaciones: 0,
          operaciones_cola_prioridad: 0,
          descartes_lazy_deletion: 0,
          total_operaciones_elementales: 3,
        },
        cola_prioridad_optima: {
          selecciones_minimo: 1,
          comparaciones_busqueda_minimo: 0,
          inspecciones_aristas: 0,
          relajaciones: 0,
          operaciones_cola_prioridad: 2,
          descartes_lazy_deletion: 0,
          total_operaciones_elementales: 2,
        },
        cola_prioridad_matriz: {
          selecciones_minimo: 1,
          comparaciones_busqueda_minimo: 0,
          inspecciones_aristas: 1,
          relajaciones: 0,
          operaciones_cola_prioridad: 2,
          descartes_lazy_deletion: 0,
          total_operaciones_elementales: 3,
        },
        cola_prioridad_literal: {
          selecciones_minimo: 1,
          comparaciones_busqueda_minimo: 0,
          inspecciones_aristas: 1,
          relajaciones: 0,
          operaciones_cola_prioridad: 4,
          descartes_lazy_deletion: 0,
          total_operaciones_elementales: 5,
        },
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => respuestaSimulada,
      })
    );

    render(<App />);

    const pestanaSandbox = screen.getByRole("button", {
      name: /3\. Laboratorio y Sandbox en Vivo/i,
    });
    await usuario.click(pestanaSandbox);

    const selectorGrafo = screen.getByLabelText(/Selector de grafo/i);
    expect(selectorGrafo).toHaveValue("crear_grafo");
    expect(screen.queryByTestId("nodo-grafo-0")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Paso siguiente/i })
    ).toBeInTheDocument();

    const botonAgregarVertice = screen.getByRole("button", {
      name: /\+ Agregar vértice/i,
    });
    await usuario.click(botonAgregarVertice);
    await usuario.click(botonAgregarVertice);

    const nodo0 = screen.getByTestId("nodo-grafo-0");
    const nodo1 = screen.getByTestId("nodo-grafo-1");

    await usuario.click(nodo0);
    expect(nodo0.getAttribute("data-seleccionado")).toBe("true");

    await usuario.click(nodo1);
    const aristaCreada = screen.getByTestId("arista-grupo-0-1");
    expect(aristaCreada).toBeInTheDocument();
    expect(screen.getByTestId("peso-texto-0-1")).toHaveTextContent("1");

    await usuario.click(aristaCreada);
    const inputPesoInline = screen.getByTestId("input-peso-0-1");
    await usuario.clear(inputPesoInline);
    await usuario.type(inputPesoInline, "12{Enter}");
    expect(screen.getByTestId("peso-texto-0-1")).toHaveTextContent("12");

    const botonPlay = screen.getByRole("button", { name: /Ejecutar algoritmo/i });
    await usuario.click(botonPlay);

    expect(await screen.findByText(/Inicialización del algoritmo\./i)).toBeInTheDocument();
    expect(screen.getByText(/Grafo Original \(A\)/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Grafo de Dijkstra \(D\) — Creación Paso a Paso/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("nodo-dijkstra-0")).toBeInTheDocument();
    expect(screen.getByTestId("timer-proporcional-sandbox")).toBeInTheDocument();
    expect(
      screen.getByText(/Comparativa en este grafo \(Operaciones y Tiempo\)/i)
    ).toBeInTheDocument();

    await usuario.click(aristaCreada);
    const botonBorrarArista = screen.getByTestId("borrar-arista-0-1");
    await usuario.click(botonBorrarArista);
    expect(screen.queryByTestId("arista-grupo-0-1")).not.toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("separa visualmente las aristas bidireccionales (ida y vuelta) y permite arrastrar nodos para reorganizarlos", async () => {
    const usuario = userEvent.setup();
    render(<App />);

    const pestanaSandbox = screen.getByRole("button", {
      name: /3\. Laboratorio y Sandbox en Vivo/i,
    });
    await usuario.click(pestanaSandbox);

    const botonAgregarVertice = screen.getByRole("button", {
      name: /\+ Agregar vértice/i,
    });
    await usuario.click(botonAgregarVertice);
    await usuario.click(botonAgregarVertice);

    const nodo0 = screen.getByTestId("nodo-grafo-0");
    const nodo1 = screen.getByTestId("nodo-grafo-1");

    await usuario.click(nodo0);
    await usuario.click(nodo1);

    await usuario.click(nodo1);
    await usuario.click(nodo0);

    const aristaIda = screen.getByTestId("arista-path-0-1");
    const aristaVuelta = screen.getByTestId("arista-path-1-0");

    expect(aristaIda.getAttribute("data-bidireccional")).toBe("true");
    expect(aristaVuelta.getAttribute("data-bidireccional")).toBe("true");
    expect(aristaIda.getAttribute("d")).not.toEqual(
      aristaVuelta.getAttribute("d")
    );

    const circuloNodo0 = nodo0.querySelector("circle");
    const xInicial = Number(circuloNodo0?.getAttribute("cx"));
    const yInicial = Number(circuloNodo0?.getAttribute("cy"));

    const lienzoSvg = screen.getByLabelText(/Lienzo interactivo del grafo/i);

    fireEvent.mouseDown(nodo0, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(lienzoSvg, { clientX: 180, clientY: 160 });
    fireEvent.mouseUp(lienzoSvg, { clientX: 180, clientY: 160 });

    const xNuevo = Number(circuloNodo0?.getAttribute("cx"));
    const yNuevo = Number(circuloNodo0?.getAttribute("cy"));

    expect(xNuevo).not.toBe(xInicial);
    expect(yNuevo).not.toBe(yInicial);
  });
});
