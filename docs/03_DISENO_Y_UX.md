# 03_DISENO_Y_UX: Sistema de Diseño y Experiencia "Anti-Jira"

## 1. Filosofía Visual y Cognitiva (El "Modo Zen")
* **Objetivo:** Impulsar la productividad y la relajación mental. Diseño limpio, sin ruido visual.
* **Estética:** Minimalista y funcional. Uso de paletas monocromáticas (Zinc/Slate) con colores de acento (Azul/Índigo sutil) SOLO para llamar a la acción (CTAs) o indicar estados (Verde/Éxito, Rojo/Error).
* **Modo Oscuro (Dark Mode):** Soporte nativo de primer nivel. El modo oscuro debe reducir la fatiga visual con contrastes suaves, no con negros absolutos (#000000).

## 2. Sistema de Diseño Modular (Stack de UI)
Para garantizar consistencia infinita al agregar nuevos módulos y mantener el código libre de archivos CSS gigantes, se DEBE usar el siguiente stack:
* **Tailwind CSS:** Para estilos utilitarios (cero archivos `.css` o `.scss` personalizados).
* **Componentes Base (Headless UI):** Usar bibliotecas como **Radix UI** o **shadcn/ui**. Los componentes (Botones, Inputs, Modales) se construyen UNA vez en la carpeta `/components/ui` y se reutilizan en todo el proyecto.
* **Iconografía:** Consistente, usando librerías ligeras como `Lucide React`.



## 3. PWA y Responsividad (100% Adaptable)
* **Progressive Web App (PWA):** La aplicación debe estar configurada con su `manifest.json` y Service Workers para poder ser instalada en Desktop y Mobile.
* **Mobile First Estructural:** Las grillas y layouts base deben usar las clases de Tailwind (`flex-col`, `md:flex-row`) para colapsar lógicamente en celulares.
* **Adaptación de Interfaces Complejas:** En el móvil, tableros densos (Kanban) o Diagramas deben colapsar en listas navegables o permitir controles táctiles de paneo/zoom intuitivos.

## 4. UX Educativa e Incorporada (Onboarding Modular)
El frontend debe educar sin interrumpir. NADA de tutoriales obligatorios que bloqueen la pantalla.
* **Placeholders Funcionales:** Todo `input` y `textarea` DEBE tener un placeholder que muestre exactamente qué se espera. (Ej: en vez de "Criterio", usar "Ej: Dado que soy admin, cuando toco X, entonces Y...").
* **Componente `<InfoTooltip />`:** Cada título de módulo o concepto técnico complejo (Ej: "Deuda Técnica", "Velocity") debe ir acompañado de este micromódulo. Al pasar el mouse/tocar, explica el concepto en lenguaje coloquial.
* **Empty States (Estados Vacíos) Útiles:** Si no hay tickets o diagramas, la pantalla vacía debe tener una ilustración suave, explicar para qué sirve esa sección y tener un botón de acción principal ("Crear mi primer diagrama").

## 5. Entorno de Diagramas y Pizarras (Foco y Exportación)
El lienzo visual (React Flow) debe comportarse como una app nativa:
* **Modo Inmersivo:** Botón estandarizado de "Pantalla Completa" (Fullscreen API) para esconder la barra lateral y superior del "Anti-Jira" mientras se modela.
* **Controles Integrados:** Minimapa, controles de Zoom (Scroll wheel) y Paneo (Click + Drag) siempre presentes.
* **Exportación Perfecta:** Los diagramas deben poder exportarse en PDF, SVG, PNG, JPEG y JSON. **Regla Técnica:** Antes de capturar el lienzo (ej. con `html-to-image`), el código debe calcular el *Bounding Box* (caja delimitadora) de todos los nodos y ajustar el viewport para evitar recortes en la imagen exportada.

## 6. LÍMITES DE CÓDIGO FRONTEND (Regla Anti-Spaghetti UI)
Ningún archivo de la interfaz debe superar las 200-250 líneas. Para lograrlo:
* **Separación de Lógica y Vista:** Si un componente de React tiene más de 3 funciones manejadoras de eventos (`handleX`), esa lógica DEBE extraerse a un Custom Hook en un archivo separado (Ej: `useDiagramManager.ts`).
* **Micro-Componentización:** Si un formulario tiene 4 secciones, NO hacer las 4 en el mismo archivo. Crear `<SeccionImpacto />`, `<SeccionRestricciones />`, etc., y unirlas en un archivo padre.

## 7. Tono de Voz y Copywriting (El Lenguaje "Anti-Jira")
La interfaz no es un simple panel de control, actúa como un **Consejero Técnico y Mentor**. Todo texto generado para la UI (alertas, placeholders, modales, correos) DEBE respetar este manual de estilo:

* **Idioma y Localización:** Español latinoamericano con modismos argentinos profesionales (Uso del "vos" en lugar del "tú" o "usted"). Ej: "Configurá tu proyecto" en lugar de "Configure su proyecto". Evitar lunfardo excesivo; mantener la claridad técnica.
* **Inclusión Técnica (Senior + Junior):** El lenguaje debe unir a los equipos. Usar términos técnicos solo cuando sea estrictamente necesario, y SIEMPRE acompañarlos de una explicación amigable o un `<InfoTooltip />`. 
  * *Mal:* "Excepción de concurrencia en pipeline CI/CD."
  * *Bien:* "Ups, hubo un choque en las subidas. Dos procesos intentaron actualizar esto al mismo tiempo. Te recomiendo revisar el historial de Git."
* **Asertividad y Refuerzo Positivo:** Celebrar las victorias del usuario y suavizar los errores. 
  * *Mal:* "Error: Faltan Criterios de Aceptación."
  * *Bien:* "¡Casi listo! Agregale un par de Criterios de Aceptación a esta historia así tu equipo sabe exactamente cuándo darla por terminada."
* **Enfoque en el Beneficio (Educar vendiendo la idea):** Nunca pedirle al usuario que llene un dato sin explicarle *qué gana* con eso. 
  * *Mal:* "Complete el Stack Tecnológico."
  * *Bien:* "Definí tu Stack acá una sola vez, y te automatizo todos los prompts de desarrollo para el resto del proyecto. ¡Te vas a ahorrar horas de tipeo!"