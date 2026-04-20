# MÓDULO: fase_1_requisitos (Requisitos y User Story Mapping)

## 1. Objetivo del Módulo
Traducir el ADN del proyecto (armado en la Fase 0) en una estructura de desarrollo concreta (Épicas e Historias de Usuario) **sin tener que escribir una sola tarjeta a mano**. El módulo facilita un entorno visual 2D para planificar el "Qué" del sistema y refinar las reglas de negocio usando formato BDD (Behavior-Driven Development).

## 2. Procesos y Flujo de Trabajo
* **Generador de Prompt Maestro:** El sistema lee la tabla `projects.project_context` y concatena esa información en una plantilla predefinida que el usuario copia. Este prompt le pide a una IA externa (ChatGPT/Claude) que estructure el proyecto y devuelva un JSON estricto.
* **Renderizado Mágico (El Lienzo 2D):** El usuario pega el JSON devuelto por la IA en un input de la web. El sistema lo parsea y dibuja automáticamente un tablero de User Story Mapping (Épicas arriba en horizontal, Historias cayendo en vertical).
* **Refinamiento BDD:** Al hacer clic en una Historia del tablero, se abre un panel lateral para detallar los Criterios de Aceptación usando plantillas estrictas (Dado / Cuando / Entonces).

## 3. Inputs y Outputs Estrictos
**Inputs:**
* `feasibility_data` (JSONB) heredado de la Fase 0.
* Archivo/Texto JSON externo pegado por el usuario.

**Outputs (Base de Datos `agile`):**
* Tabla `epics`: Registros de los grandes bloques del sistema.
* Tabla `stories`: Historias de usuario ancladas a una épica.
* **Criterios BDD:** Se guardan dentro de `stories` en una columna `bdd_criteria` (JSONB) para mantener la limpieza relacional.

## 4. Retroalimentación (El Beneficio Activo)
* **Conexión con el Backlog:** Al terminar de acomodar el mapa 2D, el sistema genera automáticamente el esqueleto del Backlog para la Fase 3. ¡Cero tickets manuales!
* **Conexión con Testing (Fase 4):** Los criterios BDD definidos acá viajarán solos y se convertirán en la checklist de Casos de Prueba.
* **Micro-Copy Educativo (Tono Mentor Argentino):** * *Al pegar el JSON:* "¡Magia pura! Mirá cómo se armó tu mapa. Ahora arrastrá las tarjetas para priorizar qué entra en el MVP y qué dejamos para después."
  * *Al llenar el BDD:* "Acordate: si definís bien el Dado/Cuando/Entonces acá, en la Fase de Testing solo vas a tener que poner tildes. Escribilo claro."

## 5. Reglas Estrictas para la IA (Generación de Código Frontend)
* **Arquitectura del Tablero 2D:** Utilizar `Pragmatic Drag and Drop` (Atlassian) para lograr fluidez extrema. NADA de re-renders masivos al arrastrar una historia de una épica a otra. El ordenamiento visual debe ser rápido e independiente del estado global.
* **UI Educativa (Placeholders):** * En el campo de Refinamiento BDD, el placeholder DEBE guiar al usuario: *"Ej: DADO que soy un usuario logueado, CUANDO toco 'Comprar', ENTONCES se descuenta el stock y me llega un mail..."*.
* **Límite de Componentes:** El lienzo 2D puede volverse un archivo de 1000 líneas fácilmente si no se controla. La IA DEBE separar en micro-componentes: `<StoryMapBoard />`, `<EpicColumn />`, `<StoryCard />`, `<BddEditorPanel />`. Ninguno debe superar las 250 líneas.
* **Manejo de Errores JSON:** Si el usuario pega un JSON mal formateado, el sistema debe atrapar el error (try/catch) y mostrar un mensaje amigable: *"Che, parece que a la IA le faltó una coma o el formato no es válido. Revisá el texto que pegaste."*, sin romper (crashear) la aplicación blanca.