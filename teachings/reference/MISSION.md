# Mission: Defensa Oral del TP Optativo 1 — Algoritmo de Dijkstra con Cola de Prioridad

## Why
Aprobar con solvencia la defensa oral del Primer TP Optativo de Diseño y Análisis de Algoritmos, en la que cada integrante del grupo debe responder correctamente dos preguntas conceptuales o de análisis de complejidad del profesor y demostrar en vivo que el código funciona sobre un grafo dado.

## Success looks like
- Explicar sin dudar cada línea del seudocódigo reescrito y de su implementación en Python (`heapq`), justificando qué cambia respecto al arreglo `U` original.
- Desarrollar en el pizarrón o frente al profesor el cálculo de complejidad $O(V^2)$ vs. $O((V + E) \log V)$ (y los casos intermedios $O(V^2 + E \log V)$ con matriz de adyacencia o degradación por reemplazo literal sin acceso $O(1)$).
- Responder con precisión cualquier pregunta teórica sobre los 5 elementos de una solución Greedy, precondición de pesos positivos, grafos densos vs. dispersos y *Lazy Deletion* ($\log E = O(\log V)$).
- Operar en vivo el Laboratorio y Sandbox para cargar cualquier grafo que pida el profesor y validar el resultado paso a paso.

## Constraints
- Las respuestas durante la defensa oral deben ser claras, rigurosas y ajustadas a la nomenclatura de la cátedra (`GrafoTDA`, `ColaPrioridadTDA`, `Nodo`, elementos Greedy).

## Out of scope
- Algoritmos de caminos mínimos para pesos negativos (Bellman-Ford) o todos contra todos (Floyd-Warshall), más allá de saber explicar por qué Dijkstra no admite aristas negativas.
