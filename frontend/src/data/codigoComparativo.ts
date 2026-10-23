import { LenguajeCodigo } from "../types/dijkstra";

export interface BloqueFuncionAlineado {
  idSeccion: string;
  esVacio: boolean;
  codigo: string;
}

export interface ColumnaCodigoParalelo {
  id: string;
  insignia: string;
  varianteInsignia: "neutral" | "exito" | "advertencia";
  titulo: string;
  complejidad: string;
  codigoAlineado: string;
  bloquesFunciones: BloqueFuncionAlineado[];
}

interface SeccionAlineada {
  idSeccion: string;
  arreglo: string[];
  optima: string[];
  sinArreglo: string[];
}

function rellenarLineas(lineas: string[], altoObjetivo: number): string[] {
  const normalizadas = lineas.map((linea) => (linea === "" ? " " : linea));
  const faltantes = Math.max(0, altoObjetivo - normalizadas.length);
  return [...normalizadas, ...Array.from({ length: faltantes }, () => " ")];
}

function esBloqueSinContenido(lineas: string[]): boolean {
  return lineas.every((linea) => linea.trim() === "");
}

function construirColumnasAlineadas(secciones: SeccionAlineada[]): {
  bloquesArreglo: BloqueFuncionAlineado[];
  bloquesOptima: BloqueFuncionAlineado[];
  bloquesSinArreglo: BloqueFuncionAlineado[];
  textoCompletoArreglo: string;
  textoCompletoOptima: string;
  textoCompletoSinArreglo: string;
} {
  const bloquesArreglo: BloqueFuncionAlineado[] = [];
  const bloquesOptima: BloqueFuncionAlineado[] = [];
  const bloquesSinArreglo: BloqueFuncionAlineado[] = [];

  secciones.forEach((seccion) => {
    const altoMaximo = Math.max(
      seccion.arreglo.length,
      seccion.optima.length,
      seccion.sinArreglo.length
    );

    const lineasArreglo = rellenarLineas(seccion.arreglo, altoMaximo);
    const lineasOptima = rellenarLineas(seccion.optima, altoMaximo);
    const lineasSinArreglo = rellenarLineas(seccion.sinArreglo, altoMaximo);

    bloquesArreglo.push({
      idSeccion: seccion.idSeccion,
      esVacio: esBloqueSinContenido(seccion.arreglo),
      codigo: lineasArreglo.join("\n"),
    });
    bloquesOptima.push({
      idSeccion: seccion.idSeccion,
      esVacio: esBloqueSinContenido(seccion.optima),
      codigo: lineasOptima.join("\n"),
    });
    bloquesSinArreglo.push({
      idSeccion: seccion.idSeccion,
      esVacio: esBloqueSinContenido(seccion.sinArreglo),
      codigo: lineasSinArreglo.join("\n"),
    });
  });

  return {
    bloquesArreglo,
    bloquesOptima,
    bloquesSinArreglo,
    textoCompletoArreglo: bloquesArreglo.map((b) => b.codigo).join("\n\n"),
    textoCompletoOptima: bloquesOptima.map((b) => b.codigo).join("\n\n"),
    textoCompletoSinArreglo: bloquesSinArreglo
      .map((b) => b.codigo)
      .join("\n\n"),
  };
}

const SECCIONES_SEUDOCODIGO: SeccionAlineada[] = [
  {
    idSeccion: "estructura_nodo",
    arreglo: [
      "class Nodo {",
      "  boolean selec",
      "  int costo",
      "  int prev",
      "}",
    ],
    optima: [
      "class Nodo {",
      "  boolean selec",
      "  int costo",
      "  int prev",
      "}",
    ],
    sinArreglo: [],
  },
  {
    idSeccion: "algoritmo_principal",
    arreglo: [
      "algoritmo Dijkstra(G : GrafoTDA) {",
      "  Nodo[] U = crearArreglo(G)",
      "",
      "",
      "",
      "  while (!completo(U)) {",
      "    int i = buscarMinimo(U)",
      "",
      "",
      "    U[i].selec = true",
      "    actualizar(G, U, i)",
      "  }",
      "  return U",
      "}",
    ],
    optima: [
      "algoritmo Dijkstra(G : GrafoTDA) {",
      "  Nodo[] U = crearArreglo(G)",
      "  ColaPrioridadTDA Q = new ColaPrioridad()",
      "  Q.inicializarCola()",
      "  Q.acolarPrioridad(0, 0)",
      "  while (!Q.colaVacia()) {",
      "    int i = Q.primero()",
      "    Q.desacolar()",
      "    if (U[i].selec) continue",
      "    U[i].selec = true",
      "    actualizar(G, U, Q, i)",
      "  }",
      "  return U",
      "}",
    ],
    sinArreglo: [
      "algoritmo Dijkstra(G : GrafoTDA) {",
      "  ColaPrioridadTDA Q = crearCola(G)",
      "  ColaPrioridadTDA Res = new ColaPrioridad()",
      "  Res.inicializarCola()",
      "",
      "  while (!Q.colaVacia()) {",
      "    int i = Q.primero()",
      "    int costoI = Q.prioridad()",
      "    Q.desacolar()",
      "    Res.acolarPrioridad(i, costoI)",
      "    actualizarSinArreglo(G, Q, i, costoI)",
      "  }",
      "  return Res",
      "}",
    ],
  },
  {
    idSeccion: "inicializacion",
    arreglo: [
      "Nodo[] crearArreglo(GrafoTDA G) {",
      "  int cant = G.vertices()",
      "  Nodo[] Arreglo = new Nodo[cant]",
      "  for (int i = 0; i < cant; i++) {",
      "    Nodo O = new Nodo()",
      "    O.prev = 0",
      "    if (i == 0) {",
      "      O.selec = true",
      "      O.costo = 0",
      "    } else {",
      "      O.selec = false",
      "      if (G.existeArista(0, i))",
      "        O.costo = G.pesoArista(0, i)",
      "      else",
      "        O.costo = ∞",
      "    }",
      "    Arreglo[i] = O",
      "  }",
      "  return Arreglo",
      "}",
    ],
    optima: [
      "Nodo[] crearArreglo(GrafoTDA G) {",
      "  int cant = G.vertices()",
      "  Nodo[] Arreglo = new Nodo[cant]",
      "  for (int i = 0; i < cant; i++) {",
      "    Nodo O = new Nodo()",
      "    O.prev = 0",
      "    O.selec = false",
      "    O.costo = (i == 0) ? 0 : ∞",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "    Arreglo[i] = O",
      "  }",
      "  return Arreglo",
      "}",
    ],
    sinArreglo: [
      "ColaPrioridadTDA crearCola(GrafoTDA G) {",
      "  int cant = G.vertices()",
      "  ColaPrioridadTDA Q = new ColaPrioridad()",
      "  Q.inicializarCola()",
      "  for (int i = 0; i < cant; i++) {",
      "    int costo = (i == 0) ? 0 : ∞",
      "    Q.acolarPrioridad(i, costo)",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "  }",
      "  return Q",
      "}",
    ],
  },
  {
    idSeccion: "ciclo_interno_actualizar",
    arreglo: [
      "void actualizar(",
      "  GrafoTDA G, Nodo[] A, int i",
      ") {",
      "",
      "",
      "  for (int j = 0; j < A.length; j++) {",
      "",
      "",
      "    if (!A[j].selec && G.existeArista(i, j)) {",
      "      int nuevo = A[i].costo + G.pesoArista(i, j)",
      "      if (nuevo < A[j].costo) {",
      "        A[j].costo = nuevo",
      "        A[j].prev = i",
      "",
      "      }",
      "    }",
      "  }",
      "",
      "",
      "",
      "",
      "}",
    ],
    optima: [
      "void actualizar(",
      "  GrafoTDA G, Nodo[] A, ColaPrioridadTDA Q, int i",
      ") {",
      "",
      "",
      "  for (int j : G.adyacentes(i)) {",
      "",
      "",
      "    if (!A[j].selec) {",
      "      int nuevo = A[i].costo + G.pesoArista(i, j)",
      "      if (nuevo < A[j].costo) {",
      "        A[j].costo = nuevo",
      "        A[j].prev = i",
      "        Q.acolarPrioridad(j, nuevo)",
      "      }",
      "    }",
      "  }",
      "",
      "",
      "",
      "",
      "}",
    ],
    sinArreglo: [
      "void actualizarSinArreglo(",
      "  GrafoTDA G, ColaPrioridadTDA Q, int i, int cI",
      ") {",
      "  ColaPrioridadTDA QAux = new ColaPrioridad()",
      "  QAux.inicializarCola()",
      "  while (!Q.colaVacia()) {",
      "    int j = Q.primero()",
      "    int cJ = Q.prioridad()",
      "    Q.desacolar()",
      "    if (G.existeArista(i, j)) {",
      "      int nuevo = cI + G.pesoArista(i, j)",
      "      if (nuevo < cJ)",
      "        cJ = nuevo",
      "",
      "    }",
      "    QAux.acolarPrioridad(j, cJ)",
      "  }",
      "  while (!QAux.colaVacia()) {",
      "    Q.acolarPrioridad(QAux.primero(), QAux.prioridad())",
      "    QAux.desacolar()",
      "  }",
      "}",
    ],
  },
  {
    idSeccion: "auxiliares_busqueda_lineal",
    arreglo: [
      "boolean completo(Nodo[] X) {",
      "  boolean listo = true",
      "  for (int i = 0; i < X.length; i++)",
      "    listo = listo && X[i].selec",
      "  return listo",
      "}",
      "",
      "int buscarMinimo(Nodo[] E) {",
      "  int min = ∞",
      "  int inx = 0",
      "  for (int i = 0; i < E.length; i++) {",
      "    if (E[i].costo < min && !E[i].selec) {",
      "      min = E[i].costo",
      "      inx = i",
      "    }",
      "  }",
      "  return inx",
      "}",
    ],
    optima: [],
    sinArreglo: [],
  },
];

const SECCIONES_PYTHON: SeccionAlineada[] = [
  {
    idSeccion: "estructura_nodo",
    arreglo: [
      "from dataclasses import dataclass",
      "import math",
      "",
      "@dataclass",
      "class Nodo:",
      "  selec: bool = False",
      "  costo: float = math.inf",
      "  prev: int = 0",
    ],
    optima: [
      "from dataclasses import dataclass",
      "import heapq",
      "import math",
      "@dataclass",
      "class Nodo:",
      "  selec: bool = False",
      "  costo: float = math.inf",
      "  prev: int = 0",
    ],
    sinArreglo: [
      "import math",
      "from backend.dijkstra_engine import (",
      "  ColaPrioridadTDA",
      ")",
    ],
  },
  {
    idSeccion: "algoritmo_principal",
    arreglo: [
      "def dijkstra(grafo: GrafoTDA) -> list[Nodo]:",
      "  arreglo_u = crear_arreglo(grafo)",
      "",
      "",
      "  while not completo(arreglo_u):",
      "    i = buscar_minimo(arreglo_u)",
      "    if i is None:",
      "      break",
      "    arreglo_u[i].selec = True",
      "    actualizar(grafo, arreglo_u, i)",
      "  return arreglo_u",
    ],
    optima: [
      "def dijkstra(grafo: Grafo) -> list[Nodo]:",
      "  arreglo_u = crear_arreglo(grafo)",
      "  cola_q: list[tuple[float, int]] = []",
      "  heapq.heappush(cola_q, (0, 0))",
      "  while len(cola_q) > 0:",
      "    _, i = heapq.heappop(cola_q)",
      "    if arreglo_u[i].selec:",
      "      continue",
      "    arreglo_u[i].selec = True",
      "    actualizar(grafo, arreglo_u, cola_q, i)",
      "  return arreglo_u",
    ],
    sinArreglo: [
      "def dijkstra_sin_arreglo(grafo: GrafoTDA):",
      "  cola_q = crear_cola_inicial(grafo)",
      "  res = ColaPrioridadTDA()",
      "  res.inicializar_cola()",
      "  while not cola_q.cola_vacia():",
      "    i = cola_q.primero()['vertice']",
      "    costo_i = cola_q.prioridad()",
      "    cola_q.desacolar()",
      "    res.acolar_prioridad(i, costo_i, 0)",
      "    actualizar_sin_arreglo(grafo, cola_q, i, costo_i)",
      "  return res",
    ],
  },
  {
    idSeccion: "inicializacion",
    arreglo: [
      "def crear_arreglo(grafo: GrafoTDA) -> list[Nodo]:",
      "  cant = grafo.vertices()",
      "  arreglo: list[Nodo] = []",
      "  for i in range(cant):",
      "    nodo = Nodo(False, math.inf, 0)",
      "    if i == 0:",
      "      nodo.selec = True",
      "      nodo.costo = 0",
      "    elif grafo.existe_arista(0, i):",
      "      nodo.costo = grafo.peso_arista(0, i)",
      "    arreglo.append(nodo)",
      "  return arreglo",
    ],
    optima: [
      "def crear_arreglo(grafo: Grafo) -> list[Nodo]:",
      "  cant = grafo.vertices()",
      "  arreglo = [",
      "    Nodo(False, math.inf, 0)",
      "    for _ in range(cant)",
      "  ]",
      "  if cant > 0:",
      "    arreglo[0].costo = 0",
      "",
      "",
      "",
      "  return arreglo",
    ],
    sinArreglo: [
      "def crear_cola_inicial(grafo: GrafoTDA):",
      "  cant = grafo.vertices()",
      "  cola_q = ColaPrioridadTDA()",
      "  cola_q.inicializar_cola()",
      "  for i in range(cant):",
      "    costo = 0.0 if i == 0 else math.inf",
      "    cola_q.acolar_prioridad(i, costo, 0)",
      "",
      "",
      "",
      "",
      "  return cola_q",
    ],
  },
  {
    idSeccion: "ciclo_interno_actualizar",
    arreglo: [
      "def actualizar(",
      "  grafo: GrafoTDA, a: list[Nodo], i: int",
      ") -> None:",
      "",
      "",
      "  for j in range(len(a)):",
      "",
      "",
      "    if not a[j].selec and grafo.existe_arista(i, j):",
      "      nuevo = a[i].costo + grafo.peso_arista(i, j)",
      "      if nuevo < a[j].costo:",
      "        a[j].costo = nuevo",
      "        a[j].prev = i",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    optima: [
      "def actualizar(",
      "  grafo: Grafo, a: list[Nodo], q: list, i: int",
      ") -> None:",
      "",
      "",
      "  for j, peso in grafo.adyacentes(i):",
      "",
      "",
      "    if not a[j].selec:",
      "      nuevo = a[i].costo + peso",
      "      if nuevo < a[j].costo:",
      "        a[j].costo = nuevo",
      "        a[j].prev = i",
      "        heapq.heappush(q, (nuevo, j))",
      "",
      "",
      "",
      "",
      "",
    ],
    sinArreglo: [
      "def actualizar_sin_arreglo(",
      "  grafo: GrafoTDA, q: ColaPrioridadTDA, i: int, c_i: float",
      ") -> None:",
      "  q_aux = ColaPrioridadTDA()",
      "  q_aux.inicializar_cola()",
      "  while not q.cola_vacia():",
      "    j = q.primero()['vertice']",
      "    c_j = q.prioridad()",
      "    q.desacolar()",
      "    if grafo.existe_arista(i, j):",
      "      nuevo = c_i + grafo.peso_arista(i, j)",
      "      if nuevo < c_j:",
      "        c_j = nuevo",
      "    q_aux.acolar_prioridad(j, c_j, 0)",
      "  while not q_aux.cola_vacia():",
      "    j_aux = q_aux.primero()['vertice']",
      "    q.acolar_prioridad(j_aux, q_aux.prioridad(), 0)",
      "    q_aux.desacolar()",
      "",
    ],
  },
  {
    idSeccion: "auxiliares_busqueda_lineal",
    arreglo: [
      "def completo(arreglo_x: list[Nodo]) -> bool:",
      "  listo = True",
      "  for nodo in arreglo_x:",
      "    listo = listo and nodo.selec",
      "  return listo",
      "",
      "def buscar_minimo(arreglo_e: list[Nodo]):",
      "  minimo = math.inf",
      "  inx = None",
      "  for i, nodo in enumerate(arreglo_e):",
      "    if not nodo.selec and nodo.costo < minimo:",
      "      minimo = nodo.costo",
      "      inx = i",
      "  return inx",
    ],
    optima: [],
    sinArreglo: [],
  },
];

const SEUDOCODIGO_ALINEADO = construirColumnasAlineadas(SECCIONES_SEUDOCODIGO);
const PYTHON_ALINEADO = construirColumnasAlineadas(SECCIONES_PYTHON);

export const COLUMNAS_COMPARATIVAS_POR_LENGUAJE: Record<
  LenguajeCodigo,
  ColumnaCodigoParalelo[]
> = {
  seudocodigo: [
    {
      id: "arreglo_original",
      insignia: "Versión Original Cátedra",
      varianteInsignia: "neutral",
      titulo: "1. Con Arreglo U",
      complejidad: "O(V²)",
      codigoAlineado: SEUDOCODIGO_ALINEADO.textoCompletoArreglo,
      bloquesFunciones: SEUDOCODIGO_ALINEADO.bloquesArreglo,
    },
    {
      id: "cola_optima",
      insignia: "Variante Óptima",
      varianteInsignia: "exito",
      titulo: "2. Cola de Prioridad + Arreglo U",
      complejidad: "O((V + E) log V)",
      codigoAlineado: SEUDOCODIGO_ALINEADO.textoCompletoOptima,
      bloquesFunciones: SEUDOCODIGO_ALINEADO.bloquesOptima,
    },
    {
      id: "cola_sin_arreglo",
      insignia: "Variante No Óptima",
      varianteInsignia: "advertencia",
      titulo: "3. Cola de Prioridad sin Arreglo",
      complejidad: "O(V³) / O(V² log V)",
      codigoAlineado: SEUDOCODIGO_ALINEADO.textoCompletoSinArreglo,
      bloquesFunciones: SEUDOCODIGO_ALINEADO.bloquesSinArreglo,
    },
  ],
  python: [
    {
      id: "arreglo_original",
      insignia: "Versión Original Cátedra",
      varianteInsignia: "neutral",
      titulo: "1. Con Arreglo U",
      complejidad: "O(V²)",
      codigoAlineado: PYTHON_ALINEADO.textoCompletoArreglo,
      bloquesFunciones: PYTHON_ALINEADO.bloquesArreglo,
    },
    {
      id: "cola_optima",
      insignia: "Variante Óptima",
      varianteInsignia: "exito",
      titulo: "2. Cola de Prioridad + Arreglo U",
      complejidad: "O((V + E) log V)",
      codigoAlineado: PYTHON_ALINEADO.textoCompletoOptima,
      bloquesFunciones: PYTHON_ALINEADO.bloquesOptima,
    },
    {
      id: "cola_sin_arreglo",
      insignia: "Variante No Óptima",
      varianteInsignia: "advertencia",
      titulo: "3. Cola de Prioridad sin Arreglo",
      complejidad: "O(V³) / O(V² log V)",
      codigoAlineado: PYTHON_ALINEADO.textoCompletoSinArreglo,
      bloquesFunciones: PYTHON_ALINEADO.bloquesSinArreglo,
    },
  ],
};
