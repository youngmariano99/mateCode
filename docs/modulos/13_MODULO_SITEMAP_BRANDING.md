# Especificación Técnica: Módulo "Sitemap Visual & Branding Studio" (Fase 2)

## 1. Visión General
Este submódulo dentro de la Fase 2 consta de dos herramientas:
1. **Wiremap (Sitemap de Secciones):** Un tablero donde las columnas representan Páginas, y las tarjetas apiladas verticalmente representan las Secciones de esa página. 
2. **Branding Studio:** Un formulario estructurado en 6 pasos para definir la identidad del proyecto, con una vista previa en tiempo real.
Ambos alimentarán el `PromptEngineService` para dar contexto a futuros prompts, y podrán ser exportados como Markdown.

## 2. Contrato de Datos (Sitemap JSON)
El Sitemap utilizará un AST bidireccional. La estructura NO es un grafo de nodos unidos por líneas, sino columnas (Páginas) que contienen listas (Secciones).

```typescript
export interface SectionDef {
  id: string;
  title: string;          // Ej: "Sección de Beneficios"
  description: string;    // Ej: "Lista de 3 ventajas principales..."
  is_header?: boolean;
  is_footer?: boolean;
}

export interface PageDef {
  id: string;
  name: string;           // Ej: "Inicio", "Precios"
  route: string;          // Ej: "/home", "/pricing"
  sections: SectionDef[];
}

export interface UniversalSitemap {
  project_name: string;
  pages: PageDef[];
}

3. UI/UX: El Wiremap (Sitemap)
Layout: Contenedor con scroll horizontal. Adentro, columnas verticales (Páginas).

Columnas (Páginas): Encabezado con el nombre de la página. Debajo, las tarjetas de secciones apiladas de arriba a abajo.

Interacción Bidireccional: Un botón "Importar/Editar JSON" abre un modal. Si se pega un JSON válido, el tablero se redibuja. Un botón "+" en cada página permite agregar secciones manualmente, actualizando el JSON invisible.

4. Contrato de Datos & UI: Branding Studio
Estructura BrandingProfile:

identity: nombre, proposito, slogan, personalidad.

visuals: colores (primary, secondary, accent, background en HEX), tipografias (heading, body), estilo_imagenes.

layout_rules: navbar_style, footer_style.

voice: tono, prohibidas, slang.

restrictions: no_go_list.

Vista Previa en Vivo (Live Preview):
Al costado o debajo del formulario, un componente <BrandPreview /> simula una "Hero Section" aplicando dinámicamente los colores HEX y las tipografías seleccionadas en el formulario para que el usuario vea cómo combinan.

5. Integración con el Contexto y Exportación
Motor de Prompts (PromptEngineService): Al compilar el "Súper Prompt Maestro", se debe serializar el UniversalSitemap y el BrandingProfile para que la IA entienda la estructura de navegación y la estética.

Exportación MD: Un botón "Exportar a Markdown" que genera un archivo .md iterando el JSON del sitemap (usando listas anidadas) y formateando el Branding con sus códigos HEX y reglas.