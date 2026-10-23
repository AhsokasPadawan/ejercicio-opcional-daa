interface SeccionComplejidadAlineada {
  idSeccion: string;
  arreglo: string[];
  optima: string[];
  sinArreglo: string[];
}

interface BloqueFuncionComplejidad {
  idSeccion: string;
  esVacio: boolean;
  lineas: string[];
}

interface ColumnaComplejidadPython {
  id: string;
  insignia: string;
  varianteInsignia: "neutral" | "exito" | "advertencia";
  titulo: string;
  complejidadTotal: string;
  bloques: BloqueFuncionComplejidad[];
}

const MAPA_CLASE_INSIGNIA: Record<"neutral" | "exito" | "advertencia", string> =
  {
    neutral: "badge-neutral",
    exito: "badge-exito",
    advertencia: "badge-advertencia",
  };

function rellenarLineasComplejidad(
  lineas: string[],
  altoObjetivo: number
): string[] {
  const normalizadas = lineas.map((linea) => (linea === "" ? " " : linea));
  const faltantes = Math.max(0, altoObjetivo - normalizadas.length);
  return [...normalizadas, ...Array.from({ length: faltantes }, () => " ")];
}

function esBloqueVacio(lineas: string[]): boolean {
  return lineas.every((linea) => linea.trim() === "");
}

const SECCIONES_PYTHON_CON_COSTOS: SeccionComplejidadAlineada[] = [
  {
    idSeccion: "estructura_nodo",
    arreglo: [
      "# Costo por instancia: O(1)",
      "@dataclass",
      "class Nodo:",
      "  selec: bool = False  # O(1)",
      "  costo: float = math.inf  # O(1)",
      "  prev: int = 0  # O(1)",
    ],
    optima: [
      "# Costo por instancia: O(1)",
      "@dataclass",
      "class Nodo:",
      "  selec: bool = False  # O(1)",
      "  costo: float = math.inf  # O(1)",
      "  prev: int = 0  # O(1)",
    ],
    sinArreglo: [],
  },
  {
    idSeccion: "algoritmo_principal",
    arreglo: [
      "# Costo Total: O(V²)",
      "def dijkstra(grafo: GrafoTDA):",
      "  arreglo_u = crear_arreglo(grafo)  # O(V)",
      "",
      "",
      "  while not completo(arreglo_u):  # V veces * O(V) = O(V²)",
      "    i = buscar_minimo(arreglo_u)  # V veces * O(V) = O(V²)",
      "    if i is None:  # O(1)",
      "      break",
      "    arreglo_u[i].selec = True  # O(1)",
      "    actualizar(grafo, arreglo_u, i)  # V veces * O(V) = O(V²)",
      "  return arreglo_u  # O(1)",
    ],
    optima: [
      "# Costo Total: O((V + E) log V)",
      "def dijkstra(grafo: Grafo):",
      "  arreglo_u = crear_arreglo(grafo)  # O(V)",
      "  cola_q: list[tuple[float, int]] = []  # O(1)",
      "  heapq.heappush(cola_q, (0, 0))  # O(log V)",
      "  while len(cola_q) > 0:  # O(E) iteraciones * O(1)",
      "    _, i = heapq.heappop(cola_q)  # O(log V) -> Total: O(E log V)",
      "    if arreglo_u[i].selec:  # O(1)",
      "      continue",
      "    arreglo_u[i].selec = True  # O(1)",
      "    actualizar(grafo, arreglo_u, cola_q, i)  # Total: O(E log V)",
      "  return arreglo_u  # O(1)",
    ],
    sinArreglo: [
      "# Costo Total: O(V³) / O(V² log V)",
      "def dijkstra_sin_arreglo(grafo: GrafoTDA):",
      "  cola_q = crear_cola_inicial(grafo)  # O(V²) / O(V log V)",
      "  res = ColaPrioridadTDA()  # O(1)",
      "  res.inicializar_cola()  # O(1)",
      "  while not cola_q.cola_vacia():  # V iteraciones * O(1)",
      "    i = cola_q.primero()['vertice']  # O(1)",
      "    costo_i = cola_q.prioridad()  # O(1)",
      "    cola_q.desacolar()  # O(1) ó O(log V)",
      "    res.acolar_prioridad(i, costo_i, 0)  # O(V) ó O(log V)",
      "    actualizar_sin_arreglo(grafo, cola_q, i, costo_i)  # V * O(V²) = O(V³)",
      "  return res  # O(1)",
    ],
  },
  {
    idSeccion: "inicializacion",
    arreglo: [
      "# Costo de crear_arreglo: O(V)",
      "def crear_arreglo(grafo: GrafoTDA):",
      "  cant = grafo.vertices()  # O(1)",
      "  arreglo: list[Nodo] = []  # O(1)",
      "  for i in range(cant):  # V iteraciones -> O(V)",
      "    nodo = Nodo(False, math.inf, 0)  # O(1)",
      "    if i == 0:  # O(1)",
      "      nodo.selec = True  # O(1)",
      "      nodo.costo = 0  # O(1)",
      "    elif grafo.existe_arista(0, i):  # O(1)",
      "      nodo.costo = grafo.peso_arista(0, i)  # O(1)",
      "    arreglo.append(nodo)  # O(1)",
      "  return arreglo  # O(1)",
    ],
    optima: [
      "# Costo de crear_arreglo: O(V)",
      "def crear_arreglo(grafo: Grafo):",
      "  cant = grafo.vertices()  # O(1)",
      "  arreglo = [  # V iteraciones -> O(V)",
      "    Nodo(False, math.inf, 0)  # O(1)",
      "    for _ in range(cant)",
      "  ]",
      "  if cant > 0:  # O(1)",
      "    arreglo[0].costo = 0  # O(1)",
      "",
      "",
      "",
      "  return arreglo  # O(1)",
    ],
    sinArreglo: [
      "# Costo de crear_cola_inicial: O(V²) / O(V log V)",
      "def crear_cola_inicial(grafo: GrafoTDA):",
      "  cant = grafo.vertices()  # O(1)",
      "  cola_q = ColaPrioridadTDA()  # O(1)",
      "  cola_q.inicializar_cola()  # O(1)",
      "  for i in range(cant):  # V iteraciones",
      "    costo = 0.0 if i == 0 else math.inf  # O(1)",
      "    cola_q.acolar_prioridad(i, costo, 0)  # O(V) ó O(log V)",
      "",
      "",
      "",
      "",
      "  return cola_q  # O(1)",
    ],
  },
  {
    idSeccion: "ciclo_interno_actualizar",
    arreglo: [
      "# Costo por llamada: O(V) | Acumulado en Dijkstra: O(V²)",
      "def actualizar(",
      "  grafo: GrafoTDA, a: list[Nodo], i: int",
      ") -> None:",
      "",
      "",
      "  for j in range(len(a)):  # V iteraciones -> O(V)",
      "",
      "",
      "    if not a[j].selec and grafo.existe_arista(i, j):  # O(1)",
      "      nuevo = a[i].costo + grafo.peso_arista(i, j)  # O(1)",
      "      if nuevo < a[j].costo:  # O(1)",
      "        a[j].costo = nuevo  # O(1)",
      "        a[j].prev = i  # O(1)",
      "",
      "",
      "",
      "",
      "",
    ],
    optima: [
      "# Costo por llamada: O(grado(i) log V) | Acumulado: O(E log V)",
      "def actualizar(",
      "  grafo: Grafo, a: list[Nodo], q: list, i: int",
      ") -> None:",
      "",
      "",
      "  for j, peso in grafo.adyacentes(i):  # ∑ grado(i) = E en total",
      "",
      "",
      "    if not a[j].selec:  # O(1) gracias al arreglo U",
      "      nuevo = a[i].costo + peso  # O(1)",
      "      if nuevo < a[j].costo:  # O(1) gracias al arreglo U",
      "        a[j].costo = nuevo  # O(1)",
      "        a[j].prev = i  # O(1)",
      "        heapq.heappush(q, (nuevo, j))  # O(log V)",
      "",
      "",
      "",
      "",
    ],
    sinArreglo: [
      "# Costo por llamada: O(V²) / O(V log V) | Acumulado: O(V³) / O(V² log V)",
      "def actualizar_sin_arreglo(",
      "  grafo: GrafoTDA, q: ColaPrioridadTDA, i: int, c_i: float",
      ") -> None:",
      "  q_aux = ColaPrioridadTDA()  # O(1)",
      "  q_aux.inicializar_cola()  # O(1)",
      "  while not q.cola_vacia():  # V iteraciones para vaciar Q",
      "    j = q.primero()['vertice']  # O(1)",
      "    c_j = q.prioridad()  # O(1)",
      "    q.desacolar()  # O(1) ó O(log V)",
      "    if grafo.existe_arista(i, j):  # O(1)",
      "      nuevo = c_i + grafo.peso_arista(i, j)  # O(1)",
      "      if nuevo < c_j:  # O(1)",
      "        c_j = nuevo  # O(1)",
      "    q_aux.acolar_prioridad(j, c_j, 0)  # O(V) ó O(log V)",
      "  while not q_aux.cola_vacia():  # V iteraciones para restaurar Q",
      "    j_aux = q_aux.primero()['vertice']  # O(1)",
      "    q.acolar_prioridad(j_aux, q_aux.prioridad(), 0)  # O(V) ó O(log V)",
      "    q_aux.desacolar()  # O(1) ó O(log V)",
    ],
  },
  {
    idSeccion: "auxiliares_busqueda_lineal",
    arreglo: [
      "# Costo por llamada: O(V) | Acumulado en while: O(V²)",
      "def completo(arreglo_x: list[Nodo]) -> bool:",
      "  listo = True  # O(1)",
      "  for nodo in arreglo_x:  # V iteraciones -> O(V)",
      "    listo = listo and nodo.selec  # O(1)",
      "  return listo  # O(1)",
      "",
      "# Costo por llamada: O(V) | Acumulado en while: O(V²)",
      "def buscar_minimo(arreglo_e: list[Nodo]):",
      "  minimo = math.inf  # O(1)",
      "  inx = None  # O(1)",
      "  for i, nodo in enumerate(arreglo_e):  # V iteraciones -> O(V)",
      "    if not nodo.selec and nodo.costo < minimo:  # O(1)",
      "      minimo = nodo.costo  # O(1)",
      "      inx = i  # O(1)",
      "  return inx  # O(1)",
    ],
    optima: [],
    sinArreglo: [],
  },
];

function construirColumnasComplejidad(): ColumnaComplejidadPython[] {
  const bloquesArreglo: BloqueFuncionComplejidad[] = [];
  const bloquesOptima: BloqueFuncionComplejidad[] = [];
  const bloquesSinArreglo: BloqueFuncionComplejidad[] = [];

  SECCIONES_PYTHON_CON_COSTOS.forEach((seccion) => {
    const altoMaximo = Math.max(
      seccion.arreglo.length,
      seccion.optima.length,
      seccion.sinArreglo.length
    );

    bloquesArreglo.push({
      idSeccion: seccion.idSeccion,
      esVacio: esBloqueVacio(seccion.arreglo),
      lineas: rellenarLineasComplejidad(seccion.arreglo, altoMaximo),
    });

    bloquesOptima.push({
      idSeccion: seccion.idSeccion,
      esVacio: esBloqueVacio(seccion.optima),
      lineas: rellenarLineasComplejidad(seccion.optima, altoMaximo),
    });

    bloquesSinArreglo.push({
      idSeccion: seccion.idSeccion,
      esVacio: esBloqueVacio(seccion.sinArreglo),
      lineas: rellenarLineasComplejidad(seccion.sinArreglo, altoMaximo),
    });
  });

  return [
    {
      id: "arreglo_original",
      insignia: "Versión Original Cátedra",
      varianteInsignia: "neutral",
      titulo: "1. Con Arreglo U",
      complejidadTotal: "O(V²)",
      bloques: bloquesArreglo,
    },
    {
      id: "cola_optima",
      insignia: "Variante Óptima",
      varianteInsignia: "exito",
      titulo: "2. Cola de Prioridad + Arreglo U",
      complejidadTotal: "O((V + E) log V)",
      bloques: bloquesOptima,
    },
    {
      id: "cola_sin_arreglo",
      insignia: "Variante No Óptima",
      varianteInsignia: "advertencia",
      titulo: "3. Cola de Prioridad sin Arreglo",
      complejidadTotal: "O(V³) / O(V² log V)",
      bloques: bloquesSinArreglo,
    },
  ];
}

const COLUMNAS_COMPLEJIDAD_PYTHON = construirColumnasComplejidad();

function renderizarLineaConComentarioAmarillo(
  linea: string,
  indiceLinea: number
) {
  const indiceNumeral = linea.indexOf("#");
  if (indiceNumeral === -1) {
    return (
      <span key={indiceLinea}>
        {linea}
        {"\n"}
      </span>
    );
  }

  const parteCodigo = linea.slice(0, indiceNumeral);
  const parteComentario = linea.slice(indiceNumeral);

  return (
    <span key={indiceLinea}>
      {parteCodigo}
      <span className="comentario-costo-amarillo">{parteComentario}</span>
      {"\n"}
    </span>
  );
}

export function VistaAnalisisComplejidad() {
  return (
    <section className="panel-vista">
      <header className="encabezado-seccion">
        <div>
          <span className="etiqueta-badge">Punto 2 y 3 del TP</span>
          <h2>Cálculo y Comparación de Complejidad Temporal</h2>
          <p className="subtitulo-seccion">
            Análisis línea por línea en Python del costo temporal de cada
            función: de O(V²) a O((V + E) log V).
          </p>
        </div>
      </header>

      <div className="grilla-tres-columnas-codigo">
        {COLUMNAS_COMPLEJIDAD_PYTHON.map((columna) => (
          <article key={columna.id} className="tarjeta-codigo">
            <header className="encabezado-tarjeta-codigo">
              <div>
                <span
                  className={MAPA_CLASE_INSIGNIA[columna.varianteInsignia]}
                >
                  {columna.insignia}
                </span>
                <h4>{columna.titulo}</h4>
              </div>
              <span className="pildora-complejidad">
                {columna.complejidadTotal}
              </span>
            </header>

            <div className="lista-cards-funciones">
              {columna.bloques.map((bloque) => (
                <pre
                  key={bloque.idSeccion}
                  className={
                    bloque.esVacio
                      ? "card-funcion-codigo card-funcion-vacia"
                      : "card-funcion-codigo"
                  }
                >
                  <code>
                    {bloque.lineas.map((linea, idx) =>
                      renderizarLineaConComentarioAmarillo(linea, idx)
                    )}
                  </code>
                </pre>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="grilla-tres-columnas">
        <article className="tarjeta-teoria">
          <span className="badge-exito">Condición 1: Mantener Acceso O(1)</span>
          <h4>¿Por qué no eliminar el Arreglo U por completo?</h4>
          <p>
            En el algoritmo original, el arreglo <code>U</code> cumple dos
            roles: <strong>buscar el mínimo</strong> en O(V) y{" "}
            <strong>guardar los costos acumulados</strong> con acceso directo
            O(1) por vértice.
          </p>
          <p>
            La Cola de Prioridad reemplaza únicamente la{" "}
            <strong>función de selección del mínimo</strong> (bajando de O(V) a
            O(log V)), mientras que conservar el vector indexado de costos
            permite consultar <code>U[j].costo</code> y verificar{" "}
            <code>U[j].selec</code> en O(1) dentro de <code>actualizar</code>.
          </p>
        </article>

        <article className="tarjeta-teoria">
          <span className="badge-exito">Condición 2: Lista de Adyacencia</span>
          <h4>El impacto del ciclo interno en actualizar</h4>
          <p>
            Si en <code>actualizar</code> se deja el bucle{" "}
            <code>for (j = 0; j &lt; V; j++)</code> preguntando{" "}
            <code>G.existeArista(i, j)</code>, el algoritmo ejecuta V
            iteraciones por cada uno de los V nodos visitados, fijando un piso
            de <strong>Ω(V²)</strong>.
          </p>
          <p>
            Al iterar sobre <code>G.adyacentes(i)</code> mediante una Lista de
            Adyacencia, la suma de iteraciones a lo largo de todos los vértices
            es exactamente <strong>∑ grado_salida(i) = E</strong>, reduciendo el
            trabajo total de relajación a <strong>O(E log V)</strong>.
          </p>
        </article>

        <article className="tarjeta-teoria">
          <span className="badge-exito">Condición 3: Lazy Deletion</span>
          <h4>¿Por qué O(log E) equivale a O(log V)?</h4>
          <p>
            Con inserción perezosa (<em>Lazy Deletion</em>), en lugar de buscar
            y modificar un nodo dentro del heap, insertamos un nuevo par{" "}
            <code>(nuevoCosto, j)</code> cada vez que se relaja una arista y
            descartamos entradas repetidas cuando salen del heap si{" "}
            <code>U[i].selec == true</code>.
          </p>
          <p>
            El heap puede tener a lo sumo <strong>E</strong> elementos. Como en
            un grafo simple <strong>E ≤ V²</strong>, por propiedades del
            logaritmo:
            <br />
            <code>log(E) ≤ log(V²) = 2 · log(V) = O(log V)</code>.
          </p>
        </article>
      </div>
    </section>
  );
}
