import { ReactElement, useState } from "react";
import { VistaAnalisisComplejidad } from "./components/VistaAnalisisComplejidad";
import { VistaComparativaCodigo } from "./components/VistaComparativaCodigo";
import { VistaLaboratorioSandbox } from "./components/VistaLaboratorioSandbox";
import { IdentificadorVista } from "./types/dijkstra";

const MAPA_VISTAS_PRESENTACION: Record<IdentificadorVista, () => ReactElement> =
  {
    comparativa_codigo: () => <VistaComparativaCodigo />,
    analisis_complejidad: () => <VistaAnalisisComplejidad />,
    laboratorio_sandbox: () => <VistaLaboratorioSandbox />,
  };

const OPCIONES_NAVEGACION: Array<{
  id: IdentificadorVista;
  etiqueta: string;
}> = [
  {
    id: "comparativa_codigo",
    etiqueta: "1. Comparativa de Código (Arreglo vs. Cola)",
  },
  {
    id: "analisis_complejidad",
    etiqueta: "2. Análisis de Complejidad",
  },
  {
    id: "laboratorio_sandbox",
    etiqueta: "3. Laboratorio y Sandbox en Vivo",
  },
];

export function App() {
  const [vistaActiva, setVistaActiva] =
    useState<IdentificadorVista>("comparativa_codigo");

  const renderizarVistaActiva = MAPA_VISTAS_PRESENTACION[vistaActiva];

  return (
    <div className="contenedor-aplicacion">
      <header className="barra-superior">
        <div className="marca-proyecto">
          <span className="insignia-materia">
            Diseño y Análisis de Algoritmos
          </span>
          <h1>Primer TP Optativo: Algoritmo de Dijkstra con Cola de Prioridad</h1>
        </div>

        <nav className="navegacion-principal" aria-label="Vistas de presentación">
          {OPCIONES_NAVEGACION.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              className={
                vistaActiva === opcion.id
                  ? "boton-navegacion activo"
                  : "boton-navegacion"
              }
              onClick={() => setVistaActiva(opcion.id)}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </nav>
      </header>

      <main className="contenido-principal">{renderizarVistaActiva()}</main>
    </div>
  );
}
