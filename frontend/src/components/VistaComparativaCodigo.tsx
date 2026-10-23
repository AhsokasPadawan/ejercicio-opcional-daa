import { useState } from "react";
import { COLUMNAS_COMPARATIVAS_POR_LENGUAJE } from "../data/codigoComparativo";
import { LenguajeCodigo } from "../types/dijkstra";

const MAPA_CLASE_INSIGNIA: Record<"neutral" | "exito" | "advertencia", string> =
  {
    neutral: "badge-neutral",
    exito: "badge-exito",
    advertencia: "badge-advertencia",
  };

export function VistaComparativaCodigo() {
  const [lenguajeActivo, setLenguajeActivo] =
    useState<LenguajeCodigo>("seudocodigo");

  const columnasParalelas = COLUMNAS_COMPARATIVAS_POR_LENGUAJE[lenguajeActivo];

  return (
    <section className="panel-vista">
      <header className="encabezado-seccion">
        <div>
          <span className="etiqueta-badge">Punto 1 y 2 del TP</span>
          <h2>Comparativa de Algoritmos: Arreglo U vs. Cola de Prioridad</h2>
        </div>

        <div className="controles-comparativa">
          <div className="grupo-selector">
            <div className="botones-segmentados">
              <button
                type="button"
                className={
                  lenguajeActivo === "seudocodigo"
                    ? "boton-segmento activo"
                    : "boton-segmento"
                }
                onClick={() => setLenguajeActivo("seudocodigo")}
              >
                Seudocódigo
              </button>
              <button
                type="button"
                className={
                  lenguajeActivo === "python"
                    ? "boton-segmento activo"
                    : "boton-segmento"
                }
                onClick={() => setLenguajeActivo("python")}
              >
                Código Python
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="grilla-tres-columnas-codigo">
        {columnasParalelas.map((columna) => (
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
              <span className="pildora-complejidad">{columna.complejidad}</span>
            </header>

            <div className="lista-cards-funciones">
              {columna.bloquesFunciones.map((bloque) => (
                <pre
                  key={bloque.idSeccion}
                  className={
                    bloque.esVacio
                      ? "card-funcion-codigo card-funcion-vacia"
                      : "card-funcion-codigo"
                  }
                >
                  <code>{bloque.codigo}</code>
                </pre>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
