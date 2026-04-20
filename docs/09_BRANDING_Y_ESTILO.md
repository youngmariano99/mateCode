# Branding y Sistema de Diseño: MateCode

## 1. Identidad de Marca
* **Nombre:** MateCode
* **Eslogan Oficial:** "Tomate un mate, la IA te arma el code."
* **Concepto Visual:** Una fusión entre la precisión técnica del software moderno (minimalismo tech) y la calidez orgánica/colaborativa del ritual del mate.
* **Logo/Iconografía:** Referencias literales pero modernas. Un "mate" con bombilla diseñado con líneas geométricas limpias (estilo wireframe o vector flat), o un mate pixel-art sutil. La iconografía del sistema debe usar la librería `lucide-react` con trazos regulares (stroke-width: 1.5).

## 2. Filosofía de la Interfaz (UI/UX)
* **Funcionalidad ante todo:** El diseño no debe entorpecer la lectura de datos. Los campos de formularios y paneles de código deben tener un alto contraste y jerarquía clara.
* **Geometría Utilitaria y Moderna:** Opción B modernizada. 
  * Los bordes de las tarjetas y botones deben ser sutilmente redondeados (en Tailwind: `rounded-md` o `rounded-lg`, evitar `rounded-full`). 
  * Las sombras deben ser nítidas y definidas para dar profundidad sin emborronar (en Tailwind: `shadow-sm` o sombras sólidas estilo neo-brutalismo ligero).
  * Uso de bordes sutiles (`border border-border/50`) para separar paneles en lugar de sombras excesivas.

## 3. Tipografía (El "Startup Premium")
Para dar una sensación de producto de alta gama, pulido y legible:
* **Fuente Principal (Sans-serif):** `Inter`, `Plus Jakarta Sans` o `Satoshi`. Se utilizará para toda la interfaz (títulos, botones, textos descriptivos).
* **Fuente de Código (Monospace):** `JetBrains Mono` o `Fira Code`. Exclusivo para mostrar fragmentos de código, JSONs o prompts en la "Trinchera" (Fase 3).

## 4. El Modo Oscuro y Paleta de Colores
El sistema soporta soporte dual (Claro/Oscuro) mediante un "Toggle", pero el **Modo Oscuro es el ciudadano de primera clase**. Está diseñado para evitar la fatiga visual del desarrollador, usando grises carbón en lugar de negros puros. En el modo claro, se evitan los blancos cegadores (usando grises cálidos muy suaves).

### Variables de Color (Para inyectar en tailwind.config.js)

**Color Principal (Verde Mate - Energía y Éxito):**
* Usado para botones principales, toggles activos y acentos.
* Hex: `#10B981` (Emerald 500) o un Verde Mate custom `#4ADE80`.

**Modo Oscuro (Por Defecto / Recomendado):**
* `background`: `#18181B` (Zinc 900 - Gris carbón, no cansa la vista).
* `foreground`: `#F4F4F5` (Zinc 100 - Texto claro).
* `card`: `#27272A` (Zinc 800 - Un tono más claro que el fondo para tarjetas).
* `border`: `#3F3F46` (Zinc 700 - Líneas divisorias sutiles).
* `muted`: `#A1A1AA` (Zinc 400 - Textos secundarios).

**Modo Claro (Alternativa Suave):**
* `background`: `#FAFAFA` (Zinc 50 - Un blanco roto cálido, no cegador).
* `foreground`: `#09090B` (Zinc 950 - Texto casi negro para máximo contraste).
* `card`: `#FFFFFF` (Blanco puro para resaltar contra el fondo roto).
* `border`: `#E4E4E7` (Zinc 200).
* `muted`: `#71717A` (Zinc 500).

## 5. Tono de Comunicación (Microcopy)
El texto en la plataforma (placeholders, alertas, modales) debe mantener el tono de "Mentor Argentino":
* En vez de *"Cargando datos..."* -> *"Calentando el agua..."* o *"Preparando el mate..."*
* En vez de *"Error interno del servidor"* -> *"Se nos lavó el mate. Hubo un error de conexión."*
* En vez de *"Código generado exitosamente"* -> *"¡Código listo! Tomate un mate mientras lo revisás."*