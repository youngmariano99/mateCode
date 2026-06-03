# 02_SITEMAP_Y_RUTAS: Sistema Operativo "Anti-Jira"

## 1. Filosofía de Navegación y Layouts
La aplicación utiliza un sistema de múltiples `Layouts` para aplicar el principio de "Revelación Progresiva" y evitar distracciones.
* **Layout Público (`PublicLayout`):** Sin navegación interna. Se usa para Login, Registro y Vistas Inyectadas (Iframes).
* **Layout Global (`GlobalLayout`):** Contiene el menú lateral principal (Sidebar). Se usa para la gestión de espacios de trabajo, CRM, Miembros y la Bóveda (Vault).
* **Layout Modo Enfoque (`FocusLayout`):** SE ACTIVA AL ENTRAR A UN PROYECTO. El `GlobalLayout` se desmonta por completo. El usuario solo ve una barra superior minimalista con un "Stepper" (Paso a paso de Fases), los miembros activos del proyecto y un botón para volver al Dashboard Global.
* **Layout Cliente (`ClientLayout`):** Vista de solo lectura e interacción limitada para el "Link Mágico". Limpia, con la marca del usuario (Portfolio/SaaS).

---

## 2. Árbol de Rutas Exacto

### 2.1. Rutas Públicas y de Adquisición (PublicLayout)
* `/login` | `/register` | `/forgot-password`
* `/form/[template_id]` -> **VISTA INYECTABLE (Iframe):** Esta ruta está diseñada para ser incrustada vía `<iframe src="...">` en webs externas. Solo renderiza el formulario de SurveyJS limpio.
* `/client/[magic_token]` -> **PORTAL DEL CLIENTE (Link Mágico):** Acceso seguro sin contraseña. El cliente ve demos, avances y puede dejar feedback que se traduce en tickets.

### 2.2. Espacio Global y Capa de Negocio (GlobalLayout)
El entorno donde el usuario gestiona su negocio o su equipo. Depende del `tenant_id` (Workspace activo).
* `/app/dashboard` -> Vista general. Proyectos recientes, tareas asignadas urgentes.
* `/app/crm/leads` -> Bandeja de entrada de formularios completados (Potenciales clientes).
* `/app/crm/clients` -> Listado de clientes aprobados.
* `/app/team` -> Matriz de Miembros. Invitaciones por mail y asignación de roles visuales + JSON de permisos.
* `/app/vault` -> **La Bóveda.** Gestión de Plantillas de Formularios, Stacks guardados (Fase 2) y Módulos reutilizables.
* `/app/portfolio` -> Listado de proyectos finalizados exportables para armar la web/portfolio. Botón de **"Importación Express"** (formulario rápido para cargar proyectos del pasado).

### 2.3. Modo Enfoque: El Proyecto (FocusLayout)
El núcleo operativo. Al acceder a estas rutas, desaparecen el CRM, los leads y la bóveda.
* `/projects/[id]` -> Redirecciona automáticamente a la Fase activa más avanzada.
* `/projects/[id]/settings` -> Wizard de configuración: Activar/Desactivar módulos y Fases para este proyecto en particular.

**Navegación Secuencial de Fases (El Stepper):**
* `/projects/[id]/phase-0-feasibility` -> "El Qué". Impacto, KPIs y vinculación con el cliente (CRM).
* `/projects/[id]/phase-1-requirements` -> Tablero 2D de User Story Mapping y redacción BDD.
* `/projects/[id]/phase-2-design` -> "El Cómo". Selección del Stack, Arquitectura y Pizarras (Diagramas ERD/Sitemaps).
* `/projects/[id]/phase-3-implementation` -> "La Trinchera". Tablero Kanban de alto rendimiento, Sprints y Motor de Prompts. Hub de links externos y feedback del cliente.
* `/projects/[id]/phase-4-testing` -> Ejecución de Casos de Prueba (derivados del BDD) y reporte directo a Deuda Técnica.
* `/projects/[id]/phase-5-deploy` -> Checklist de despliegue y botón de "Exportar a Portfolio" / "Guardar Stack en Bóveda".

---

## 3. Reglas de Enrutamiento para la IA
* **Protección Estricta:** Todas las rutas bajo `/app` y `/projects` requieren autenticación y validación del `tenant_id` en el contexto.
* **Componentización:** La IA debe crear un componente Router central (ej. en `App.tsx` o usando el app router de Next.js/React Router v6) que envuelva las rutas dinámicas con sus respectivos Layouts.
* **Estado de la URL:** Los filtros de los tableros Kanban o del CRM DEBEN reflejarse en los parámetros de búsqueda de la URL (Ej: `?status=todo&assignee=mariano`) para que los enlaces sean compartibles entre el equipo.