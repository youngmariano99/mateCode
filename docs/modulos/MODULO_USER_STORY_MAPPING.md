# Especificación Técnica: Módulo "User Story Mapping" (Fase 1)

## 1. Visión General
El objetivo de la Fase 1 es generar un "User Story Map" bidimensional basado en la metodología de Jeff Patton. El sistema no usará un Kanban plano, sino un mapa estructurado donde:
- **Eje Horizontal (Backbone):** Representa el viaje del usuario agrupado por Epics (Módulos grandes) y Features (Pasos específicos).
- **Eje Vertical (Swimlanes/Releases):** Representa la prioridad y las entregas, separando las historias de usuario por Versiones (Ej: V1 MVP, V2, V3).

## 2. Contrato de Datos (Estructura JSON Estricta)
El Frontend y el Backend se comunicarán mediante un JSON estructurado de forma jerárquica. La IA externa SIEMPRE debe devolver los datos respetando esta interfaz exacta:

```json
{
  "proyecto": "Nombre del Proyecto",
  "personas": [
    { "id": "p1", "nombre": "Laura", "rol": "Usuario" }
  ],
  "releases": [
    { "id": "v1", "nombre": "Version 1 (MVP)", "descripcion": "Core funcional" },
    { "id": "v2", "nombre": "Version 2", "descripcion": "Mejoras" }
  ],
  "epics": [
    {
      "id": "e1",
      "nombre": "Gestión de Emails",
      "color": "#b82ba8",
      "features": [
        {
          "id": "f1",
          "nombre": "Buscar y Filtrar",
          "color": "#1ac5d9",
          "personas_ids": ["p1"],
          "user_stories": [
            { "id": "us1", "titulo": "Buscar por palabra clave", "release_id": "v1", "criterios_aceptacion": [] },
            { "id": "us2", "titulo": "Búsqueda avanzada", "release_id": "v2", "criterios_aceptacion": [] }
          ]
        }
      ]
    }
  ]
}

3. Lógica del Motor de Prompts (Backend)
El servicio PromptEngineService debe tener una plantilla específica para la Fase 1. Al solicitar el Prompt de Estructuración, debe:

Inyectar TODO el contexto disponible de la Fase 0 (ADN, Stack, Blueprint Arquitectónico).

Instruir a la IA a realizar el corte vertical ("Slicing") en al menos 3 releases (V1, V2, V3).

Exigir que la salida sea ÚNICAMENTE el JSON crudo del contrato de datos, sin bloques de markdown adicionales ni saludos.

4. Arquitectura de UI/UX (Frontend - React + Tailwind)
El componente principal UserStoryMapBoard.tsx debe renderizar el JSON en una grilla estricta:

Estructura Base: Utilizar CSS Grid o Flexbox anidados para garantizar que las columnas coincidan perfectamente. Las columnas totales del tablero están determinadas por la cantidad total de features.

Capa Superior (Personas): Rombo o Badge sobre las features indicando qué persona usa esa feature.

Capa 1 (Epics - Squelette): Tarjetas anchas (col-span) que agrupan visualmente a sus features hijas.

Capa 2 (Features - Flux Narratif): Tarjetas individuales que actúan como cabeceras de columna.

Capa 3 (Swimlanes / Releases): Filas horizontales que cruzan todo el tablero, separadas por líneas punteadas. Cada fila representa un release.

Intersecciones (User Stories): Dentro de la fila de un Release, y bajo la columna de una Feature, se renderizan las tarjetas de user_stories estilo "Post-it" con sus títulos y detalles menores.

Interacción: El usuario debe poder pegar el JSON generado por la IA externa en un modal, y el tablero debe re-dibujarse automáticamente.

