import {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  useRef,
  useState,
} from "react";
import { CATALOGO_PRESETS_GRAFOS } from "../data/presetsGrafos";
import {
  AristaGrafo,
  PosicionNodoGrafo,
  RespuestaEjecucionDijkstra,
  VarianteEjecucionBackend,
} from "../types/dijkstra";

interface EstadoArrastreNodo {
  idNodo: number;
  inicioClienteX: number;
  inicioClienteY: number;
  origenNodoX: number;
  origenNodoY: number;
  movioSuficiente: boolean;
}

interface GeometriaAristaSvg {
  dPath: string;
  etiquetaX: number;
  etiquetaY: number;
  esBidireccional: boolean;
}

const ANCHO_VIEWBOX_SVG = 800;
const ALTO_VIEWBOX_SVG = 470;
const RADIO_NODO_BASE = 24;
const RADIO_NODO_SELECCIONADO = 29;
const MS_POR_OPERACION_SIMULADA = 45;

const MAPA_ETIQUETA_VARIANTE: Record<VarianteEjecucionBackend, string> = {
  cola_prioridad_optima: "2. Cola + Arreglo U (Óptima)",
  arreglo: "1. Con Arreglo U (Cátedra)",
  cola_prioridad_literal: "3. Cola sin Arreglo (QAux)",
};

function limitarCoordenada(
  valor: number,
  minimo: number,
  maximo: number
): number {
  return Math.max(minimo, Math.min(maximo, Math.round(valor)));
}

function calcularPosicionNuevoVertice(indice: number): PosicionNodoGrafo {
  const centroX = 400;
  const centroY = 235;
  const radio = 155;
  const angulo = (indice * (2 * Math.PI)) / 7 - Math.PI / 2;
  return {
    id: indice,
    x: Math.round(centroX + radio * Math.cos(angulo)),
    y: Math.round(centroY + radio * Math.sin(angulo)),
  };
}

function calcularGeometriaArista(
  nodoOrigen: PosicionNodoGrafo,
  nodoDestino: PosicionNodoGrafo,
  esBidireccional: boolean
): GeometriaAristaSvg {
  const dx = nodoDestino.x - nodoOrigen.x;
  const dy = nodoDestino.y - nodoOrigen.y;
  const distancia = Math.hypot(dx, dy) || 1;

  const unidadX = dx / distancia;
  const unidadY = dy / distancia;
  const normalX = -unidadY;
  const normalY = unidadX;

  if (!esBidireccional) {
    const inicioX = nodoOrigen.x + unidadX * RADIO_NODO_BASE;
    const inicioY = nodoOrigen.y + unidadY * RADIO_NODO_BASE;
    const finX = nodoDestino.x - unidadX * (RADIO_NODO_BASE + 4);
    const finY = nodoDestino.y - unidadY * (RADIO_NODO_BASE + 4);

    return {
      dPath: `M ${inicioX} ${inicioY} L ${finX} ${finY}`,
      etiquetaX: (inicioX + finX) / 2,
      etiquetaY: (inicioY + finY) / 2,
      esBidireccional: false,
    };
  }

  const desplazamientoLateral = 9;
  const curvaturaControl = 42;

  const inicioDesplazadoX =
    nodoOrigen.x + normalX * desplazamientoLateral + unidadX * RADIO_NODO_BASE;
  const inicioDesplazadoY =
    nodoOrigen.y + normalY * desplazamientoLateral + unidadY * RADIO_NODO_BASE;

  const finDesplazadoX =
    nodoDestino.x +
    normalX * desplazamientoLateral -
    unidadX * (RADIO_NODO_BASE + 4);
  const finDesplazadoY =
    nodoDestino.y +
    normalY * desplazamientoLateral -
    unidadY * (RADIO_NODO_BASE + 4);

  const puntoMedioX = (nodoOrigen.x + nodoDestino.x) / 2;
  const puntoMedioY = (nodoOrigen.y + nodoDestino.y) / 2;

  const controlX = puntoMedioX + normalX * curvaturaControl;
  const controlY = puntoMedioY + normalY * curvaturaControl;

  const etiquetaX =
    0.25 * inicioDesplazadoX + 0.5 * controlX + 0.25 * finDesplazadoX;
  const etiquetaY =
    0.25 * inicioDesplazadoY + 0.5 * controlY + 0.25 * finDesplazadoY;

  return {
    dPath: `M ${inicioDesplazadoX} ${inicioDesplazadoY} Q ${controlX} ${controlY} ${finDesplazadoX} ${finDesplazadoY}`,
    etiquetaX,
    etiquetaY,
    esBidireccional: true,
  };
}

function formatearSegundosTimer(milisegundos: number): string {
  return `${(milisegundos / 1000).toFixed(2)} s`;
}

export function VistaLaboratorioSandbox() {
  const [opcionDropdownGrafo, setOpcionDropdownGrafo] =
    useState<string>("crear_grafo");
  const [nodos, setNodos] = useState<PosicionNodoGrafo[]>([]);
  const [aristas, setAristas] = useState<AristaGrafo[]>([]);

  const [nodoOrigenPendiente, setNodoOrigenPendiente] = useState<number | null>(
    null
  );
  const [aristaSeleccionadaClave, setAristaSeleccionadaClave] = useState<
    string | null
  >(null);
  const [borradorPesoInline, setBorradorPesoInline] = useState<string>("1");
  const [mensajeErrorValidacion, setMensajeErrorValidacion] = useState<
    string | null
  >(null);

  const [varianteBackend, setVarianteBackend] =
    useState<VarianteEjecucionBackend>("cola_prioridad_optima");

  const [respuestaSandbox, setRespuestaSandbox] =
    useState<RespuestaEjecucionDijkstra | null>(null);
  const [indicePasoAlgoritmo, setIndicePasoAlgoritmo] = useState<number>(0);
  const [ejecutandoEnServidor, setEjecutandoEnServidor] =
    useState<boolean>(false);

  const [autoPlayActivo, setAutoPlayActivo] = useState<boolean>(false);
  const [mostrarPanelTimer, setMostrarPanelTimer] = useState<boolean>(false);
  const [tiempoTranscurridoMs, setTiempoTranscurridoMs] = useState<number>(0);

  const referenciaSvg = useRef<SVGSVGElement | null>(null);
  const referenciaIntervaloTimer = useRef<number | null>(null);
  const [arrastreActivo, setArrastreActivo] =
    useState<EstadoArrastreNodo | null>(null);

  const pasosAlgoritmoActivos = respuestaSandbox?.pasos_algoritmo ?? [];
  const pasoAlgoritmoActual =
    pasosAlgoritmoActivos[
      Math.min(
        indicePasoAlgoritmo,
        Math.max(0, pasosAlgoritmoActivos.length - 1)
      )
    ] ?? null;

  function detenerTimerAnimacion() {
    if (referenciaIntervaloTimer.current !== null) {
      window.clearInterval(referenciaIntervaloTimer.current);
      referenciaIntervaloTimer.current = null;
    }
    setAutoPlayActivo(false);
  }

  function calcularTiempoProporcionalTotalMs(
    datos: RespuestaEjecucionDijkstra,
    variante: VarianteEjecucionBackend
  ): number {
    const opsVariante =
      datos.comparativa_metricas[variante]?.total_operaciones_elementales ??
      datos.metricas.total_operaciones_elementales;
    return Math.max(300, opsVariante * MS_POR_OPERACION_SIMULADA);
  }

  function iniciarReproduccionConTimerProporcional(
    datos: RespuestaEjecucionDijkstra,
    variante: VarianteEjecucionBackend
  ) {
    detenerTimerAnimacion();
    setMostrarPanelTimer(true);

    const totalPasos = datos.pasos_algoritmo.length;
    const duracionTotalMs = calcularTiempoProporcionalTotalMs(datos, variante);

    if (totalPasos <= 1) {
      setIndicePasoAlgoritmo(0);
      setTiempoTranscurridoMs(duracionTotalMs);
      return;
    }

    setIndicePasoAlgoritmo(0);
    setTiempoTranscurridoMs(0);
    setAutoPlayActivo(true);

    const inicioMs = performance.now();

    referenciaIntervaloTimer.current = window.setInterval(() => {
      const transcurrido = performance.now() - inicioMs;
      if (transcurrido >= duracionTotalMs) {
        setTiempoTranscurridoMs(duracionTotalMs);
        setIndicePasoAlgoritmo(totalPasos - 1);
        detenerTimerAnimacion();
        return;
      }

      const fraccionAvance = transcurrido / duracionTotalMs;
      const nuevoIndice = Math.min(
        totalPasos - 1,
        Math.floor(fraccionAvance * totalPasos)
      );
      setTiempoTranscurridoMs(transcurrido);
      setIndicePasoAlgoritmo(nuevoIndice);
    }, 30);
  }

  async function solicitarTrazasDijkstraAlServidor(
    nodosActuales: PosicionNodoGrafo[],
    aristasActuales: AristaGrafo[],
    varianteActual: VarianteEjecucionBackend,
    reproducirConTimer: boolean
  ): Promise<RespuestaEjecucionDijkstra | null> {
    if (nodosActuales.length === 0) {
      setRespuestaSandbox(null);
      setMostrarPanelTimer(false);
      setIndicePasoAlgoritmo(0);
      setTiempoTranscurridoMs(0);
      return null;
    }

    setEjecutandoEnServidor(true);
    setMensajeErrorValidacion(null);

    try {
      const respuesta = await fetch("/api/dijkstra/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cantidad_vertices: nodosActuales.length,
          aristas: aristasActuales,
          variante: varianteActual,
          modo_ciclo_interno: "adyacentes",
        }),
      });

      if (!respuesta.ok) {
        const detalleError = await respuesta.json();
        setMensajeErrorValidacion(
          detalleError.detail ?? "Error al ejecutar el algoritmo en el servidor."
        );
        return null;
      }

      const datos: RespuestaEjecucionDijkstra = await respuesta.json();
      setRespuestaSandbox(datos);

      if (reproducirConTimer) {
        iniciarReproduccionConTimerProporcional(datos, varianteActual);
      } else {
        setMostrarPanelTimer(false);
        setIndicePasoAlgoritmo(0);
        setTiempoTranscurridoMs(0);
      }
      return datos;
    } catch {
      setMensajeErrorValidacion(
        "No se pudo conectar con el servidor Python (FastAPI)."
      );
      return null;
    } finally {
      setEjecutandoEnServidor(false);
    }
  }

  async function cambiarPasoManualmente(nuevoIndice: number) {
    detenerTimerAnimacion();

    let datosActivos = respuestaSandbox;
    if (!datosActivos) {
      datosActivos = await solicitarTrazasDijkstraAlServidor(
        nodos,
        aristas,
        varianteBackend,
        false
      );
      if (!datosActivos) {
        return;
      }
    }

    const totalPasos = Math.max(1, datosActivos.pasos_algoritmo.length);
    const duracionTotalMs = calcularTiempoProporcionalTotalMs(
      datosActivos,
      varianteBackend
    );
    const indiceSeguro = Math.max(
      0,
      Math.min(datosActivos.pasos_algoritmo.length - 1, nuevoIndice)
    );
    setIndicePasoAlgoritmo(indiceSeguro);
    setTiempoTranscurridoMs(
      ((indiceSeguro + 1) / totalPasos) * duracionTotalMs
    );
  }

  function manejarCambioDropdownGrafo(valorSeleccionado: string) {
    detenerTimerAnimacion();
    setOpcionDropdownGrafo(valorSeleccionado);
    setNodoOrigenPendiente(null);
    setAristaSeleccionadaClave(null);
    setMensajeErrorValidacion(null);
    setRespuestaSandbox(null);
    setIndicePasoAlgoritmo(0);
    setTiempoTranscurridoMs(0);

    if (valorSeleccionado === "crear_grafo") {
      setNodos([]);
      setAristas([]);
      return;
    }

    const preset = CATALOGO_PRESETS_GRAFOS.find(
      (item) => item.id === valorSeleccionado
    );
    if (!preset) {
      return;
    }

    const nuevosNodos = preset.nodos_posiciones.map((nodo) => ({ ...nodo }));
    const nuevasAristas = preset.aristas.map((arista) => ({ ...arista }));
    setNodos(nuevosNodos);
    setAristas(nuevasAristas);
    void solicitarTrazasDijkstraAlServidor(
      nuevosNodos,
      nuevasAristas,
      varianteBackend,
      false
    );
  }

  function manejarVaciarGrafo() {
    detenerTimerAnimacion();
    setNodos([]);
    setAristas([]);
    setNodoOrigenPendiente(null);
    setAristaSeleccionadaClave(null);
    setMensajeErrorValidacion(null);
    setRespuestaSandbox(null);
    setIndicePasoAlgoritmo(0);
    setTiempoTranscurridoMs(0);
  }

  function manejarAgregarVerticeAutoincremental() {
    detenerTimerAnimacion();
    const nuevoId = nodos.length;
    const nuevaPosicion = calcularPosicionNuevoVertice(nuevoId);
    const nuevosNodos = [...nodos, nuevaPosicion];
    setNodos(nuevosNodos);
    setAristaSeleccionadaClave(null);
    setMensajeErrorValidacion(null);
    setRespuestaSandbox(null);
    setIndicePasoAlgoritmo(0);
    setTiempoTranscurridoMs(0);
  }

  function manejarClicNodoEnLienzo(idNodo: number) {
    setMensajeErrorValidacion(null);
    setAristaSeleccionadaClave(null);

    if (nodoOrigenPendiente === null) {
      setNodoOrigenPendiente(idNodo);
      return;
    }

    if (nodoOrigenPendiente === idNodo) {
      setNodoOrigenPendiente(null);
      return;
    }

    const yaExiste = aristas.some(
      (arista) =>
        arista.origen === nodoOrigenPendiente && arista.destino === idNodo
    );

    if (!yaExiste) {
      detenerTimerAnimacion();
      const nuevasAristas = [
        ...aristas,
        {
          origen: nodoOrigenPendiente,
          destino: idNodo,
          peso: 1,
        },
      ];
      setAristas(nuevasAristas);
      setRespuestaSandbox(null);
      setIndicePasoAlgoritmo(0);
      setTiempoTranscurridoMs(0);
    }

    setNodoOrigenPendiente(null);
  }

  function manejarInicioArrastreNodo(
    evento: ReactMouseEvent<SVGGElement>,
    nodo: PosicionNodoGrafo
  ) {
    evento.stopPropagation();
    setArrastreActivo({
      idNodo: nodo.id,
      inicioClienteX: evento.clientX,
      inicioClienteY: evento.clientY,
      origenNodoX: nodo.x,
      origenNodoY: nodo.y,
      movioSuficiente: false,
    });
  }

  function manejarMovimientoMouseEnLienzo(
    evento: ReactMouseEvent<SVGSVGElement>
  ) {
    if (!arrastreActivo) {
      return;
    }

    const deltaClienteX = evento.clientX - arrastreActivo.inicioClienteX;
    const deltaClienteY = evento.clientY - arrastreActivo.inicioClienteY;
    const distanciaMovimiento = Math.hypot(deltaClienteX, deltaClienteY);

    if (distanciaMovimiento < 4 && !arrastreActivo.movioSuficiente) {
      return;
    }

    const rectanguloSvg = referenciaSvg.current?.getBoundingClientRect();
    const escalaX =
      rectanguloSvg && rectanguloSvg.width > 0
        ? ANCHO_VIEWBOX_SVG / rectanguloSvg.width
        : 1;
    const escalaY =
      rectanguloSvg && rectanguloSvg.height > 0
        ? ALTO_VIEWBOX_SVG / rectanguloSvg.height
        : 1;

    const nuevoX = limitarCoordenada(
      arrastreActivo.origenNodoX + deltaClienteX * escalaX,
      36,
      ANCHO_VIEWBOX_SVG - 36
    );
    const nuevoY = limitarCoordenada(
      arrastreActivo.origenNodoY + deltaClienteY * escalaY,
      36,
      ALTO_VIEWBOX_SVG - 44
    );

    setArrastreActivo({
      ...arrastreActivo,
      movioSuficiente: true,
    });

    setNodos((nodosActuales) =>
      nodosActuales.map((nodo) =>
        nodo.id === arrastreActivo.idNodo
          ? { ...nodo, x: nuevoX, y: nuevoY }
          : nodo
      )
    );
  }

  function manejarFinArrastreEnLienzo() {
    if (!arrastreActivo) {
      return;
    }

    const idNodo = arrastreActivo.idNodo;
    const fueArrastre = arrastreActivo.movioSuficiente;
    setArrastreActivo(null);

    if (!fueArrastre) {
      manejarClicNodoEnLienzo(idNodo);
    }
  }

  function manejarSeleccionarArista(arista: AristaGrafo) {
    const clave = `${arista.origen}-${arista.destino}`;
    setNodoOrigenPendiente(null);
    setAristaSeleccionadaClave(clave);
    setBorradorPesoInline(String(arista.peso));
  }

  function aplicarCambioPesoArista(
    origen: number,
    destino: number,
    nuevoTextoPeso: string
  ) {
    setBorradorPesoInline(nuevoTextoPeso);
    const pesoNumerico = Number(nuevoTextoPeso);
    if (!Number.isFinite(pesoNumerico) || pesoNumerico <= 0) {
      return;
    }

    detenerTimerAnimacion();
    setAristas((aristasActuales) =>
      aristasActuales.map((arista) =>
        arista.origen === origen && arista.destino === destino
          ? { ...arista, peso: pesoNumerico }
          : arista
      )
    );
    setRespuestaSandbox(null);
    setIndicePasoAlgoritmo(0);
    setTiempoTranscurridoMs(0);
  }

  function manejarTeclaInputPesoInline(
    evento: ReactKeyboardEvent<HTMLInputElement>
  ) {
    if (evento.key === "Enter" || evento.key === "Escape") {
      evento.preventDefault();
      setAristaSeleccionadaClave(null);
    }
  }

  function manejarEliminarArista(origen: number, destino: number) {
    detenerTimerAnimacion();
    const nuevasAristas = aristas.filter(
      (arista) => !(arista.origen === origen && arista.destino === destino)
    );
    setAristas(nuevasAristas);
    setAristaSeleccionadaClave(null);
    setRespuestaSandbox(null);
    setIndicePasoAlgoritmo(0);
    setTiempoTranscurridoMs(0);
  }

  async function manejarEjecutarEnSandbox() {
    if (nodos.length === 0) {
      setMensajeErrorValidacion(
        "Agregá al menos un vértice antes de ejecutar el algoritmo."
      );
      return;
    }

    detenerTimerAnimacion();
    await solicitarTrazasDijkstraAlServidor(
      nodos,
      aristas,
      varianteBackend,
      true
    );
  }

  const estadoTablaActual =
    pasoAlgoritmoActual?.estado_arreglo ??
    respuestaSandbox?.estado_final ??
    nodos.map((nodo) => ({
      vertice: nodo.id,
      selec: false,
      costo: nodo.id === 0 ? 0 : null,
      prev: 0,
    }));

  const nodosGrafoDijkstra = nodos.filter((nodo) => {
    const fila = estadoTablaActual.find((item) => item.vertice === nodo.id);
    return nodo.id === 0 || Boolean(fila?.selec);
  });

  const aristasGrafoDijkstra: AristaGrafo[] = estadoTablaActual
    .filter((fila) => fila.vertice !== 0 && fila.selec && fila.costo !== null)
    .map((fila) => ({
      origen: fila.prev,
      destino: fila.vertice,
      peso: fila.costo as number,
    }));

  const comparativaTresVariantes: Array<{
    clave: VarianteEjecucionBackend;
    nombre: string;
    operaciones: number;
    tiempoEscalaMs: number;
  }> = respuestaSandbox
    ? (
        [
          "arreglo",
          "cola_prioridad_optima",
          "cola_prioridad_literal",
        ] as VarianteEjecucionBackend[]
      ).map((clave) => {
        const ops =
          respuestaSandbox.comparativa_metricas[clave]
            ?.total_operaciones_elementales ?? 0;
        return {
          clave,
          nombre: MAPA_ETIQUETA_VARIANTE[clave],
          operaciones: ops,
          tiempoEscalaMs: Math.max(300, ops * MS_POR_OPERACION_SIMULADA),
        };
      })
    : [];

  const maximoOperacionesComparativa = Math.max(
    1,
    ...comparativaTresVariantes.map((item) => item.operaciones)
  );

  const duracionTotalActivaMs = respuestaSandbox
    ? calcularTiempoProporcionalTotalMs(respuestaSandbox, varianteBackend)
    : 0;

  return (
    <section className="panel-vista-sandbox">
      {mensajeErrorValidacion && (
        <div className="alerta-error" role="alert">
          {mensajeErrorValidacion}
        </div>
      )}

      <div className="layout-sandbox-setenta-treinta">
        <div className="columna-izquierda-grafo">
          <div className="barra-dropdown-superior-izquierda">
            <select
              aria-label="Selector de grafo"
              className="dropdown-selector-grafo"
              value={opcionDropdownGrafo}
              onChange={(evento) =>
                manejarCambioDropdownGrafo(evento.target.value)
              }
            >
              <option value="crear_grafo">Crear grafo</option>
              {CATALOGO_PRESETS_GRAFOS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="caja-sandbox-lienzo">
            <div className="cabecera-caja-sandbox">
              <div className="acciones-rapidas-sandbox">
                <button
                  type="button"
                  className="boton-agregar-vertice"
                  onClick={manejarAgregarVerticeAutoincremental}
                >
                  + Agregar vértice
                </button>
                <button
                  type="button"
                  className="boton-limpiar-rojo"
                  aria-label="Borrar todo el grafo"
                  title="Borrar todo"
                  onClick={manejarVaciarGrafo}
                >
                  ✕
                </button>
              </div>

              <div className="leyenda-nodos">
                <span className="item-leyenda">
                  <i className="punto-leyenda origen" /> Origen (0)
                </span>
                <span className="item-leyenda">
                  <i className="punto-leyenda actual" /> Actual
                </span>
                <span className="item-leyenda">
                  <i className="punto-leyenda visitado" /> Incorporado en D
                </span>
              </div>
            </div>

            <div className="contenedor-lienzos-sandbox dividido">
              <div className="subpanel-lienzo-sandbox">
                <div className="encabezado-subpanel-lienzo">
                  Grafo Original (A)
                </div>

                <svg
                  ref={referenciaSvg}
                  className="lienzo-svg-grafo-grande"
                  viewBox={`0 0 ${ANCHO_VIEWBOX_SVG} ${ALTO_VIEWBOX_SVG}`}
                  aria-label="Lienzo interactivo del grafo"
                  onMouseMove={manejarMovimientoMouseEnLienzo}
                  onMouseUp={manejarFinArrastreEnLienzo}
                  onMouseLeave={() => setArrastreActivo(null)}
                  onClick={() => {
                    setAristaSeleccionadaClave(null);
                  }}
                >
                  <defs>
                    <marker
                      id="flecha-normal"
                      viewBox="0 0 10 10"
                      refX="7"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                    </marker>
                    <marker
                      id="flecha-evaluada"
                      viewBox="0 0 10 10"
                      refX="7"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                    </marker>
                    <marker
                      id="flecha-camino"
                      viewBox="0 0 10 10"
                      refX="7"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
                    </marker>
                  </defs>

                  {aristas.map((arista) => {
                    const nodoOrigen = nodos.find(
                      (nodo) => nodo.id === arista.origen
                    );
                    const nodoDestino = nodos.find(
                      (nodo) => nodo.id === arista.destino
                    );
                    if (!nodoOrigen || !nodoDestino) {
                      return null;
                    }

                    const claveArista = `${arista.origen}-${arista.destino}`;
                    const estaSeleccionadaArista =
                      aristaSeleccionadaClave === claveArista;

                    const existeAristaInversa = aristas.some(
                      (otra) =>
                        otra.origen === arista.destino &&
                        otra.destino === arista.origen
                    );

                    const geometria = calcularGeometriaArista(
                      nodoOrigen,
                      nodoDestino,
                      existeAristaInversa
                    );

                    const esAristaEvaluada =
                      pasoAlgoritmoActual?.arista_evaluada?.origen ===
                        arista.origen &&
                      pasoAlgoritmoActual?.arista_evaluada?.destino ===
                        arista.destino;

                    const infoDestino = estadoTablaActual.find(
                      (item) => item.vertice === arista.destino
                    );
                    const esAristaDelArbolCaminoMinimo =
                      arista.destino !== 0 &&
                      infoDestino?.costo !== null &&
                      infoDestino?.prev === arista.origen;

                    const claveEstiloArista = esAristaEvaluada
                      ? "evaluada"
                      : esAristaDelArbolCaminoMinimo
                        ? "camino"
                        : "normal";

                    const mapaColoresArista: Record<string, string> = {
                      evaluada: "#f59e0b",
                      camino: "#10b981",
                      normal: "#64748b",
                    };

                    const mapaMarcadoresFlecha: Record<string, string> = {
                      evaluada: "url(#flecha-evaluada)",
                      camino: "url(#flecha-camino)",
                      normal: "url(#flecha-normal)",
                    };

                    const colorLinea = mapaColoresArista[claveEstiloArista];
                    const marcadorFlecha =
                      mapaMarcadoresFlecha[claveEstiloArista];

                    return (
                      <g
                        key={claveArista}
                        data-testid={`arista-grupo-${arista.origen}-${arista.destino}`}
                        onClick={(evento) => {
                          evento.stopPropagation();
                          manejarSeleccionarArista(arista);
                        }}
                        className="grupo-arista-svg"
                      >
                        <path
                          data-testid={`arista-path-${arista.origen}-${arista.destino}`}
                          data-bidireccional={
                            geometria.esBidireccional ? "true" : "false"
                          }
                          d={geometria.dPath}
                          fill="none"
                          stroke={
                            estaSeleccionadaArista ? "#38bdf8" : colorLinea
                          }
                          strokeWidth={
                            estaSeleccionadaArista ||
                            esAristaEvaluada ||
                            esAristaDelArbolCaminoMinimo
                              ? 3.5
                              : 2.2
                          }
                          markerEnd={marcadorFlecha}
                        />
                        <rect
                          x={geometria.etiquetaX - 16}
                          y={geometria.etiquetaY - 12}
                          width={32}
                          height={24}
                          rx={6}
                          fill="#0f172a"
                          stroke={
                            estaSeleccionadaArista ? "#38bdf8" : colorLinea
                          }
                          strokeWidth={estaSeleccionadaArista ? 2 : 1.5}
                        />
                        <text
                          data-testid={`peso-texto-${arista.origen}-${arista.destino}`}
                          x={geometria.etiquetaX}
                          y={geometria.etiquetaY + 4}
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize="12"
                          fontWeight="700"
                        >
                          {arista.peso}
                        </text>

                        {estaSeleccionadaArista && (
                          <>
                            <foreignObject
                              x={geometria.etiquetaX - 20}
                              y={geometria.etiquetaY - 14}
                              width={40}
                              height={28}
                              onClick={(evento) => evento.stopPropagation()}
                            >
                              <input
                                data-testid={`input-peso-${arista.origen}-${arista.destino}`}
                                className="input-peso-arista-inline"
                                type="number"
                                min="1"
                                step="any"
                                autoFocus
                                value={borradorPesoInline}
                                onChange={(evento) =>
                                  aplicarCambioPesoArista(
                                    arista.origen,
                                    arista.destino,
                                    evento.target.value
                                  )
                                }
                                onKeyDown={manejarTeclaInputPesoInline}
                              />
                            </foreignObject>

                            <g
                              data-testid={`borrar-arista-${arista.origen}-${arista.destino}`}
                              className="boton-eliminar-arista-svg"
                              onClick={(evento) => {
                                evento.stopPropagation();
                                manejarEliminarArista(
                                  arista.origen,
                                  arista.destino
                                );
                              }}
                            >
                              <circle
                                cx={geometria.etiquetaX + 31}
                                cy={geometria.etiquetaY}
                                r={10}
                                fill="#ef4444"
                              />
                              <text
                                x={geometria.etiquetaX + 31}
                                y={geometria.etiquetaY + 4}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="11"
                                fontWeight="700"
                              >
                                ✕
                              </text>
                            </g>
                          </>
                        )}
                      </g>
                    );
                  })}

                  {nodos.map((nodo) => {
                    const estadoNodo = estadoTablaActual.find(
                      (item) => item.vertice === nodo.id
                    );
                    const esActual =
                      pasoAlgoritmoActual?.vertice_actual === nodo.id;
                    const esVisitado = Boolean(estadoNodo?.selec);
                    const esSeleccionadoParaArista =
                      nodoOrigenPendiente === nodo.id;

                    const claveRellenoNodo = esActual
                      ? "actual"
                      : esVisitado
                        ? "visitado"
                        : nodo.id === 0
                          ? "origen"
                          : "pendiente";

                    const mapaColoresRellenoNodo: Record<string, string> = {
                      actual: "#f59e0b",
                      visitado: "#10b981",
                      origen: "#6366f1",
                      pendiente: "#1e293b",
                    };

                    const colorRelleno =
                      mapaColoresRellenoNodo[claveRellenoNodo];
                    const colorBorde = esSeleccionadoParaArista
                      ? "#38bdf8"
                      : esActual
                        ? "#fde68a"
                        : "#f8fafc";

                    const radioActual = esSeleccionadoParaArista
                      ? RADIO_NODO_SELECCIONADO
                      : RADIO_NODO_BASE;

                    const textoCosto =
                      estadoNodo?.costo === null ||
                      estadoNodo?.costo === undefined
                        ? "∞"
                        : String(estadoNodo.costo);

                    return (
                      <g
                        key={nodo.id}
                        data-testid={`nodo-grafo-${nodo.id}`}
                        data-seleccionado={
                          esSeleccionadoParaArista ? "true" : "false"
                        }
                        className="grupo-nodo-svg"
                        onClick={(evento) => evento.stopPropagation()}
                        onMouseDown={(evento) =>
                          manejarInicioArrastreNodo(evento, nodo)
                        }
                      >
                        <circle
                          className="circulo-nodo-svg"
                          cx={nodo.x}
                          cy={nodo.y}
                          r={radioActual}
                          fill={colorRelleno}
                          stroke={colorBorde}
                          strokeWidth={
                            esSeleccionadoParaArista || esActual ? 4 : 2
                          }
                        />
                        <text
                          x={nodo.x}
                          y={nodo.y + 5}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="15"
                          fontWeight="700"
                        >
                          {nodo.id}
                        </text>
                        <text
                          x={nodo.x}
                          y={nodo.y + radioActual + 15}
                          textAnchor="middle"
                          fill="#cbd5e1"
                          fontSize="11"
                          fontWeight="600"
                        >
                          d={textoCosto}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="subpanel-lienzo-sandbox">
                <div className="encabezado-subpanel-lienzo">
                  Grafo de Dijkstra (D) — Creación Paso a Paso
                </div>

                <svg
                  className="lienzo-svg-grafo-grande"
                  viewBox={`0 0 ${ANCHO_VIEWBOX_SVG} ${ALTO_VIEWBOX_SVG}`}
                  aria-label="Lienzo del grafo de Dijkstra paso a paso"
                >
                  <defs>
                    <marker
                      id="flecha-dijkstra-construida"
                      viewBox="0 0 10 10"
                      refX="7"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
                    </marker>
                    <marker
                      id="flecha-dijkstra-reciente"
                      viewBox="0 0 10 10"
                      refX="7"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                    </marker>
                  </defs>

                  {aristasGrafoDijkstra.map((aristaD) => {
                    const nodoOrigen = nodos.find(
                      (nodo) => nodo.id === aristaD.origen
                    );
                    const nodoDestino = nodos.find(
                      (nodo) => nodo.id === aristaD.destino
                    );
                    if (!nodoOrigen || !nodoDestino) {
                      return null;
                    }

                    const geometria = calcularGeometriaArista(
                      nodoOrigen,
                      nodoDestino,
                      false
                    );

                    const esRecienIncorporada =
                      pasoAlgoritmoActual?.evento === "seleccion_minimo" &&
                      pasoAlgoritmoActual?.vertice_actual === aristaD.destino;

                    const colorAristaD = esRecienIncorporada
                      ? "#f59e0b"
                      : "#10b981";
                    const marcadorAristaD = esRecienIncorporada
                      ? "url(#flecha-dijkstra-reciente)"
                      : "url(#flecha-dijkstra-construida)";

                    return (
                      <g
                        key={`dijkstra-${aristaD.origen}-${aristaD.destino}`}
                        data-testid={`arista-dijkstra-${aristaD.origen}-${aristaD.destino}`}
                      >
                        <path
                          d={geometria.dPath}
                          fill="none"
                          stroke={colorAristaD}
                          strokeWidth={3.5}
                          markerEnd={marcadorAristaD}
                        />
                        <rect
                          x={geometria.etiquetaX - 16}
                          y={geometria.etiquetaY - 12}
                          width={32}
                          height={24}
                          rx={6}
                          fill="#0f172a"
                          stroke={colorAristaD}
                          strokeWidth={1.8}
                        />
                        <text
                          x={geometria.etiquetaX}
                          y={geometria.etiquetaY + 4}
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize="12"
                          fontWeight="700"
                        >
                          {aristaD.peso}
                        </text>
                      </g>
                    );
                  })}

                  {nodosGrafoDijkstra.map((nodo) => {
                    const estadoNodo = estadoTablaActual.find(
                      (item) => item.vertice === nodo.id
                    );
                    const esActual =
                      pasoAlgoritmoActual?.vertice_actual === nodo.id;

                    const colorRelleno =
                      nodo.id === 0
                        ? "#6366f1"
                        : esActual
                          ? "#f59e0b"
                          : "#10b981";

                    const textoCosto =
                      estadoNodo?.costo === null ||
                      estadoNodo?.costo === undefined
                        ? "0"
                        : String(estadoNodo.costo);

                    return (
                      <g
                        key={`nodo-dijkstra-${nodo.id}`}
                        data-testid={`nodo-dijkstra-${nodo.id}`}
                      >
                        <circle
                          cx={nodo.x}
                          cy={nodo.y}
                          r={RADIO_NODO_BASE}
                          fill={colorRelleno}
                          stroke={esActual ? "#fde68a" : "#f8fafc"}
                          strokeWidth={esActual ? 4 : 2}
                        />
                        <text
                          x={nodo.x}
                          y={nodo.y + 5}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="15"
                          fontWeight="700"
                        >
                          {nodo.id}
                        </text>
                        <text
                          x={nodo.x}
                          y={nodo.y + RADIO_NODO_BASE + 15}
                          textAnchor="middle"
                          fill="#a7f3d0"
                          fontSize="11"
                          fontWeight="700"
                        >
                          d={textoCosto}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>

        <aside className="columna-derecha-ejecucion">
          <div className="panel-ejecucion-compacto">
            <div className="fila-algoritmo-play">
              <label className="campo-select-compacto">
                <span>Algoritmo a ejecutar</span>
                <select
                  value={varianteBackend}
                  onChange={(evento) => {
                    detenerTimerAnimacion();
                    const nuevaVariante =
                      evento.target.value as VarianteEjecucionBackend;
                    setVarianteBackend(nuevaVariante);
                    if (nodos.length > 0) {
                      void solicitarTrazasDijkstraAlServidor(
                        nodos,
                        aristas,
                        nuevaVariante,
                        false
                      );
                    }
                  }}
                >
                  <option value="cola_prioridad_optima">
                    Cola de Prioridad Óptima (heapq + U)
                  </option>
                  <option value="arreglo">
                    Arreglo U (Original Cátedra)
                  </option>
                  <option value="cola_prioridad_literal">
                    ColaPrioridadTDA Pura (Sin U)
                  </option>
                </select>
              </label>

              <button
                type="button"
                className="boton-play-circular"
                aria-label="Ejecutar algoritmo"
                title="Ejecutar con timer proporcional"
                disabled={ejecutandoEnServidor}
                onClick={manejarEjecutarEnSandbox}
              >
                ▶
              </button>
            </div>

            {mostrarPanelTimer && respuestaSandbox && (
              <div
                className="caja-timer-proporcional"
                data-testid="timer-proporcional-sandbox"
              >
                <div className="encabezado-timer-proporcional">
                  <span>
                    ⏱ Timer proporcional ({MS_POR_OPERACION_SIMULADA} ms / op)
                  </span>
                  <strong className="reloj-timer-amarillo">
                    {formatearSegundosTimer(tiempoTranscurridoMs)} /{" "}
                    {formatearSegundosTimer(duracionTotalActivaMs)}
                  </strong>
                </div>

                <div className="barra-progreso-timer-fondo">
                  <div
                    className="barra-progreso-timer-relleno"
                    style={{
                      width: `${Math.min(
                        100,
                        duracionTotalActivaMs > 0
                          ? (tiempoTranscurridoMs / duracionTotalActivaMs) * 100
                          : 100
                      )}%`,
                    }}
                  />
                </div>

                <div className="comparador-costos-tres-variantes">
                  <h5>Comparativa en este grafo (Operaciones y Tiempo)</h5>
                  {comparativaTresVariantes.map((item) => {
                    const esSeleccionada = item.clave === varianteBackend;
                    const anchoPorcentaje = Math.max(
                      10,
                      Math.round(
                        (item.operaciones / maximoOperacionesComparativa) * 100
                      )
                    );

                    const mapaColorBarra: Record<
                      VarianteEjecucionBackend,
                      string
                    > = {
                      cola_prioridad_optima: "barra-costo-optima",
                      arreglo: "barra-costo-arreglo",
                      cola_prioridad_literal: "barra-costo-literal",
                    };

                    return (
                      <div
                        key={item.clave}
                        className={
                          esSeleccionada
                            ? "fila-comparativa-costo activa"
                            : "fila-comparativa-costo"
                        }
                      >
                        <div className="cabecera-fila-costo">
                          <span>{item.nombre}</span>
                          <strong>
                            {item.operaciones} ops (
                            {formatearSegundosTimer(item.tiempoEscalaMs)})
                          </strong>
                        </div>
                        <div className="pista-barra-costo">
                          <div
                            className={`relleno-barra-costo ${mapaColorBarra[item.clave]}`}
                            style={{ width: `${anchoPorcentaje}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bloque-reproductor-compacto">
              <div className="controles-pasos-compactos">
                <button
                  type="button"
                  className="boton-secundario-mini"
                  aria-label="Primer paso"
                  disabled={
                    nodos.length === 0 ||
                    (indicePasoAlgoritmo <= 0 && !autoPlayActivo)
                  }
                  onClick={() => void cambiarPasoManualmente(0)}
                >
                  ⏮
                </button>
                <button
                  type="button"
                  className="boton-secundario-mini"
                  aria-label="Paso anterior"
                  disabled={nodos.length === 0 || indicePasoAlgoritmo <= 0}
                  onClick={() =>
                    void cambiarPasoManualmente(indicePasoAlgoritmo - 1)
                  }
                >
                  ◀
                </button>
                <span>
                  {pasosAlgoritmoActivos.length === 0
                    ? `Paso 0 / 0`
                    : `Paso ${indicePasoAlgoritmo + 1} / ${pasosAlgoritmoActivos.length}`}
                </span>
                <button
                  type="button"
                  className="boton-secundario-mini"
                  aria-label="Paso siguiente"
                  disabled={
                    nodos.length === 0 ||
                    (pasosAlgoritmoActivos.length > 0 &&
                      indicePasoAlgoritmo >= pasosAlgoritmoActivos.length - 1)
                  }
                  onClick={() =>
                    void cambiarPasoManualmente(
                      respuestaSandbox ? indicePasoAlgoritmo + 1 : 0
                    )
                  }
                >
                  ▶
                </button>
                <button
                  type="button"
                  className="boton-secundario-mini"
                  aria-label="Último paso"
                  disabled={
                    nodos.length === 0 ||
                    (pasosAlgoritmoActivos.length > 0 &&
                      indicePasoAlgoritmo >= pasosAlgoritmoActivos.length - 1)
                  }
                  onClick={() =>
                    void cambiarPasoManualmente(
                      pasosAlgoritmoActivos.length > 0
                        ? pasosAlgoritmoActivos.length - 1
                        : 9999
                    )
                  }
                >
                  ⏭
                </button>
              </div>

              <input
                type="range"
                aria-label="Selector directo de paso"
                min={0}
                max={Math.max(0, pasosAlgoritmoActivos.length - 1)}
                disabled={pasosAlgoritmoActivos.length === 0}
                value={
                  pasosAlgoritmoActivos.length === 0 ? 0 : indicePasoAlgoritmo
                }
                onChange={(evento) =>
                  void cambiarPasoManualmente(Number(evento.target.value))
                }
              />

              {pasoAlgoritmoActual && (
                <div
                  className={
                    pasoAlgoritmoActual.descartado_por_lazy_deletion
                      ? "caja-descripcion-paso-compacta alerta"
                      : pasoAlgoritmoActual.relajada
                        ? "caja-descripcion-paso-compacta exito"
                        : "caja-descripcion-paso-compacta"
                  }
                >
                  {pasoAlgoritmoActual.descripcion}
                </div>
              )}

              <div className="bloque-estructura-compacta">
                <h5>Arreglo U (Nodo[])</h5>
                <table className="tabla-estado-mini">
                  <thead>
                    <tr>
                      <th>V</th>
                      <th>selec</th>
                      <th>costo</th>
                      <th>prev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadoTablaActual.map((fila) => (
                      <tr
                        key={fila.vertice}
                        className={
                          pasoAlgoritmoActual?.vertice_actual === fila.vertice
                            ? "fila-activa"
                            : fila.selec
                              ? "fila-visitada"
                              : ""
                        }
                      >
                        <td>
                          <strong>{fila.vertice}</strong>
                        </td>
                        <td>{fila.selec ? "T" : "F"}</td>
                        <td>{fila.costo === null ? "∞" : fila.costo}</td>
                        <td>{fila.prev}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bloque-estructura-compacta">
                <h5>Cola de Prioridad Q</h5>
                <div className="contenedor-cola-prioridad-compacta">
                  {(pasoAlgoritmoActual?.cola_prioridad ?? []).length === 0 ? (
                    <span className="texto-atenuado">
                      {varianteBackend === "arreglo" ? "No usa Q" : "Q = ∅"}
                    </span>
                  ) : (
                    (pasoAlgoritmoActual?.cola_prioridad ?? []).map(
                      (item, idx) => (
                        <span
                          key={`${item.vertice}-${item.costo}-${idx}`}
                          className={
                            idx === 0
                              ? "chip-heap-compacto raiz"
                              : "chip-heap-compacto"
                          }
                        >
                          v{item.vertice}:{" "}
                          <strong>
                            {item.costo === null ? "∞" : item.costo}
                          </strong>
                        </span>
                      )
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
