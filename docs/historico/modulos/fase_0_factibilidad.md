# MÓDULO: fase_0_factibilidad (Inicialización y Contexto)

## 1. Objetivo del Módulo
Transformar el "humo" inicial (una idea cruda o el pedido desordenado de un cliente) en un objeto de datos concreto y estructurado. Este objeto funciona como el **ADN del proyecto** y será el insumo principal para que el Motor de Prompts genere el esqueleto del software en fases posteriores.

## 2. Procesos y Flujo de Trabajo
* **Proceso de Recolección (Inbound CRM):** Generación de formularios dinámicos (usando SurveyJS). El sistema debe proveer la capacidad de escupir un `<iframe src="...">` o un script para que el usuario pueda embeber este formulario en su propia landing page/portfolio externo.
* **Proceso de Procesamiento:** Las respuestas crudas (basadas en plantillas BANT/NEAT) entran a la base de datos como un "Lead" (Potencial Cliente).
* **Conversión:** El usuario revisa el Lead. Al hacer clic en "Aprobar", el Lead se convierte en "Cliente" y automáticamente se habilita la creación de un Proyecto asociado, entrando en el **Modo Enfoque** (Focus Mode).

## 3. Inputs y Outputs Estrictos
**Inputs:**
* Respuestas crudas obtenidas del cliente vía formulario, o carga manual por parte del Product Owner/Desarrollador.

**Outputs (El Mega-Objeto JSON):**
El módulo debe consolidar y guardar en la base de datos (campo `feasibility_data` tipo JSONB) la siguiente estructura:
1. **Definición del problema:** Qué dolor exacto o fricción se resuelve.
2. **Mapa de impacto:** Cuánto afecta (tiempo, dinero, satisfacción, errores).
3. **Usuarios y contexto:** Quiénes lo sufren y en qué entorno.
4. **Procesos actuales:** Cómo lo resuelven hoy y por qué no alcanza.
5. **Objetivo del software:** Qué esperan lograr (automatizar, centralizar, escalar).
6. **Criterios de éxito:** KPIs medibles (ej. menos errores, ahorro de 2hs diarias).
7. **Restricciones iniciales:** Limitaciones técnicas, legales o de recursos.
8. **Nivel de prioridad:** Crítico, importante o accesorio.
9. **Visión de crecimiento:** MVP puntual o plataforma escalable.

## 4. Retroalimentación (El Beneficio Activo)
* **Regla de Gamificación/UX:** El sistema DEBE incentivar al usuario a llenar la mayor cantidad de información posible. 
* **Acción:** Cuando el usuario completa todos los campos del mega-objeto, la UI debe mostrar un mensaje asertivo y alentador.
  * *Copy (Tono Mentor Argentino):* "¡Excelente! Este es el ADN de tu proyecto. Con toda esta info, en la Fase 1 te voy a armar un prompt perfecto para que la IA te genere el esqueleto del software en segundos. ¡Te ahorraste horas de tipeo!"

## 5. Reglas Estrictas para la IA (Generación de Código)
* **Separación de Layouts:** La visualización de los Leads y la generación del Iframe pertenecen al `GlobalLayout` (CRM). Una vez que se crea el proyecto y se edita su factibilidad, la vista cambia al `FocusLayout` (desaparece el menú lateral).
* **Componentización:** Para evitar archivos gigantes, dividir la UI en micro-componentes: `<LeadInbox />`, `<FormEmbedGenerator />`, y `<FeasibilityForm />` (este último usando React Hook Form para inputs rápidos).
* **Placeholders Educativos:** Cada input debe guiar al usuario. 
  * *Ejemplo:* En el input de "Procesos actuales", el placeholder debe ser: *"Ej: Actualmente mi cliente anota los pedidos en un cuaderno espiral y a la noche los pasa a un Excel, perdiendo 2 horas diarias."*