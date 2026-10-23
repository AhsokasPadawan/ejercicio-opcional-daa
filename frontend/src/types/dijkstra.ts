export type IdentificadorVista =
  | "comparativa_codigo"
  | "analisis_complejidad"
  | "laboratorio_sandbox";

export type LenguajeCodigo = "seudocodigo" | "python";

export type VarianteColaPrioridad = "optima" | "no_optima";

export type ModoCicloInterno = "adyacentes" | "matriz";

export type VarianteEjecucionBackend =
  | "cola_prioridad_optima"
  | "cola_prioridad_literal"
  | "arreglo";

export interface PosicionNodoGrafo {
  id: number;
  x: number;
  y: number;
}

export interface AristaGrafo {
  origen: number;
  destino: number;
  peso: number;
}

export interface PresetGrafo {
  id: string;
  nombre: string;
  descripcion: string;
  cantidad_vertices: number;
  nodos_posiciones: PosicionNodoGrafo[];
  aristas: AristaGrafo[];
}

export interface EstadoNodoTablaU {
  vertice: number;
  selec: boolean;
  costo: number | null;
  prev: number;
}

export interface ElementoColaPrioridad {
  vertice: number;
  costo: number | null;
}

export interface PasoConstruccionGrafo {
  paso: number;
  accion: string;
  descripcion: string;
  vertice: number | null;
  arista: AristaGrafo | null;
  matriz_adyacencia: Array<Array<number | null>>;
  lista_adyacencia: Record<string, Array<{ destino: number; peso: number }>>;
}

export interface PasoEjecucionAlgoritmo {
  paso: number;
  evento: string;
  descripcion: string;
  vertice_actual: number | null;
  arista_evaluada: AristaGrafo | null;
  relajada: boolean;
  descartado_por_lazy_deletion: boolean;
  estado_arreglo: EstadoNodoTablaU[];
  cola_prioridad: ElementoColaPrioridad[];
}

export interface MetricasEjecucion {
  selecciones_minimo: number;
  comparaciones_busqueda_minimo: number;
  inspecciones_aristas: number;
  relajaciones: number;
  operaciones_cola_prioridad: number;
  descartes_lazy_deletion: number;
  total_operaciones_elementales: number;
}

export interface RespuestaEjecucionDijkstra {
  variante_ejecutada: VarianteEjecucionBackend;
  modo_ciclo_interno: ModoCicloInterno;
  pasos_construccion: PasoConstruccionGrafo[];
  pasos_algoritmo: PasoEjecucionAlgoritmo[];
  estado_final: EstadoNodoTablaU[];
  metricas: MetricasEjecucion;
  comparativa_metricas: {
    arreglo: MetricasEjecucion;
    cola_prioridad_optima: MetricasEjecucion;
    cola_prioridad_matriz: MetricasEjecucion;
    cola_prioridad_literal: MetricasEjecucion;
  };
}
