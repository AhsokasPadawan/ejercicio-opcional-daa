# Algoritmo de Dijkstra — Glossary

Vocabulario canónico para la defensa oral del TP Optativo 1 de Diseño y Análisis de Algoritmos.

## Estrategia Greedy

**Conjunto de candidatos**:
Conjunto de todos los vértices del grafo que aún están pendientes de visitar (inicialmente todos menos el origen, o todos los vértices antes de confirmar su camino mínimo).
_Avoid_: Lista de nodos sueltos

**Función de selección**:
Criterio voraz que elige en cada iteración el vértice pendiente con menor costo acumulado desde el origen (`buscarMinimo(U)` en $O(V)$ con arreglo, o `desacolar()` en $O(\log V)$ con Cola de Prioridad).
_Avoid_: Buscador de arista mínima

**Función de factibilidad**:
Criterio que determina si un camino hacia un vecino $j$ es válido y evaluable: que $j$ no esté visitado (`!U[j].selec`) y exista la arista dirigida `(i, j)` con peso positivo.
_Avoid_: Chequeo de conexión

**Función solución**:
Condición que determina que el algoritmo halló todos los caminos mínimos alcanzables (`completo(U)` en la versión con arreglo, o `colaVacia(Q)` en la versión con Cola de Prioridad).
_Avoid_: Fin del bucle

**Objetivo**:
Minimizar el costo acumulado del camino desde el vértice origen `0` hacia cada uno de los demás vértices del grafo.
_Avoid_: Encontrar el árbol recubridor mínimo (eso es Prim/Kruskal, no Dijkstra)

## Estructuras de Datos y Complejidad

**Arreglo `U` (`Nodo[]`)**:
Vector indexado por vértice ($0 \dots V-1$) que almacena el estado `(selec, costo, prev)` de cada nodo con tiempo de acceso directo $O(1)$.
_Avoid_: Lista desordenada

**Cola de Prioridad (Min-Heap `Q`)**:
Estructura de datos que mantiene candidatos ordenados por menor `costo` y permite insertar y extraer el mínimo en $O(\log V)$.
_Avoid_: Cola FIFO común

**Relajación de arista (`actualizar`)**:
Operación que verifica si el costo de llegar a $i$ más el peso de la arista $(i, j)$ es menor que el costo conocido hacia $j$ (`U[i].costo + peso(i, j) < U[j].costo`), actualizando `U[j].costo` y `U[j].prev = i` en caso afirmativo.
_Avoid_: Suma de nodos

**Lazy Deletion (Eliminación perezosa)**:
Estrategia donde, al mejorar el costo de un vértice $j$, se inserta una nueva entrada `(nuevoCosto, j)` en el Min-Heap sin borrar la anterior, descartando luego en $O(1)$ cualquier entrada desencolada cuyo vértice ya tenga `U[i].selec == true`.
_Avoid_: Duplicación errónea de nodos
