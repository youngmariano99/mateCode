# Plan de Implementación: Sprint 0 - MateCode ("Anti-Jira")

¡Acá Tech Lead y Arquitecto listo para arrancar! He asimilado al 100% la documentación del proyecto. A continuación te presento los entregables requeridos para validar que estamos alineados antes de crear la primera línea de código.

## 1. Confirmación de Arquitectura y Restricciones
* **Clean Architecture y SOLID:** Comprendo la separación estricta por capas (Core/Domain, Application, Infrastructure y Web API) en .NET. Me comprometo a usar patrones de diseño (ej: Strategy para estados, Factory para creación compleja, Decorator) en lugar de crear código espaghetti o métodos "Dios" de 500 líneas.
* **Filosofía "Anti-Jira" y Retroalimentación:** El sistema debe operar con fricción cero, basado en revelación progresiva y flujos de sangre directos (datos de la Fase 0 nutren la Fase 1, luego Kanban, y finalmente la Bóveda para el próximo proyecto sin carga manual).
* **Restricciones Duras (Innegociables):**
  * Ningún archivo (`.ts`, `.tsx`, `.cs`) sobrepasará las ~250 líneas. Si crecemos, se extrae en Custom Hooks o clases segregadas con el Principio de Responsabilidad Única.
  * Todo el código de negocio (tablas, variables, funciones) estará en **Español Latinoamericano**, manteniendo en inglés solo palabras clave de los lenguajes/frameworks (ej. `ProyectoController` u `obtenerTodos()`).
  * Sin alucinaciones: Si no está en el modelo de datos o el requerimiento, la ejecución se detiene y te pregunto. 
  * Por cada avance registraré micro-documentación de máximo 4 líneas en `/docs/HISTORIAL_CAMBIOS.md`.
  * UX/UI: Componentes reutilizables, Tailwind con Modo Oscuro (Zinc/Blue) y enfoque educativo en los copys funcionales.

---

## 2. Propuesta de Estructura de Carpetas Inicial

### Frontend (React 18+ / Tailwind)
Vamos a adoptar una organización por módulos/rutas para escalar fácilmente sin que el explorador de archivos sea un caos:

```text
/frontend
│── /public
└── /src
    ├── /assets              # Gráficos e ilustraciones de Empty States
    ├── /components          
    │   ├── /ui              # Headless UI/shadcn base (Botones, Modales, Inputs)
    │   └── /common          # Componentes compartidos (Ej: InfoTooltip, Stepper)
    ├── /hooks               # Custom Hooks puros para abstraer lógica compleja
    ├── /layouts             # Layouts estructurales (PublicLayout, GlobalLayout, FocusLayout, ClientLayout)
    ├── /pages               # Vistas principales atadas a React Router
    │   ├── /auth
    │   ├── /dashboard
    │   ├── /projects        # Sub-rutas con sub-carpetas (Fase0, Fase1, Kanban)
    │   └── ...
    ├── /services            # Clientes HTTP (Axios/Fetch) para el backend
    ├── /store               # Estado ligero (Zustand/Context) si aplica
    ├── /types               # Interfaces TypeScript del Frontend
    ├── /utils               # Funciones de apoyo
    ├── App.tsx              # Wrapper de Contextos y Routing
    └── index.css            # Tailwind Base
```

### Backend (.NET 8/9 C# - Clean Architecture Estricta)
Divide y reinarás para mantener asincronismo y escalabilidad:

```text
/backend
├── MateCode.Core            # Entidades de Dominio e Interfaces abstractas
│   ├── Entities             # (Workspaces, Projects, Tickets, Leads, etc)
│   ├── Exceptions           # Excepciones de negocio personalizadas
│   └── Interfaces           # IRepository, IUnitOfWork
├── MateCode.Application     # Casos de uso (Lógica de la aplicación)
│   ├── DTOs                 # Data Transfer Objects
│   ├── Services             # Implementaciones de servicios de aplicación
│   └── Integrations         # Interfaces para Novu, Semantic Kernel, etc.
├── MateCode.Infrastructure  # Acceso a Datos y Servicios Externos
│   ├── Persistence          # Entity Framework Core o DapperDbContext
│   │   ├── Configurations     # Fluid API y mapeos a DB
│   │   └── Repositories       # Implementación asíncrona de IRepository
│   └── Services             # Implementación SDK Novu, MS Semantic Kernel
└── MateCode.API             # API Controllers, Middlewares y DI
    ├── Controllers
    ├── Middlewares          # Resolución de Tenant (RLS), Control de Errores Global
    └── Program.cs
```

---

## 3. Script SQL Inicial (PostgreSQL con RLS)

Este es el script base exacto generado a partir de `01_MODELO_DE_DATOS.md`. Contempla los esquemas separados, el uso de JSONB, campos nativos UUID y el inicio de la seguridad mediante Row Level Security (RLS) para evitar fuga de información entre Tenants (Workspaces).

```sql
-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CREACIÓN DE ESQUEMAS LÓGICOS
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS crm;
CREATE SCHEMA IF NOT EXISTS projects;
CREATE SCHEMA IF NOT EXISTS agile;
CREATE SCHEMA IF NOT EXISTS vault;

-- ===============================================
-- 2. TABLAS Y ESTRUCTURAS
-- ===============================================

-- ESQUEMA: core
CREATE TABLE core.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE core.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Refactorización a 3FN: Extraemos la matriz de permisos y el rol a una tabla separada
-- para evitar anomalías de actualización y dependencias transitivas en los miembros.
CREATE TABLE core.workspace_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES core.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    permissions_matrix JSONB NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE(workspace_id, name)
);

CREATE TABLE core.workspace_members (
    workspace_id UUID NOT NULL REFERENCES core.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES core.workspace_roles(id) ON DELETE RESTRICT,
    PRIMARY KEY (workspace_id, user_id)
);

-- ESQUEMA: crm
CREATE TABLE crm.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES core.workspaces(id),
    source_url VARCHAR(500),
    raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending'
);

CREATE TABLE crm.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES core.workspaces(id),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    magic_link_token UUID UNIQUE DEFAULT uuid_generate_v4()
);

-- ESQUEMA: projects
CREATE TABLE projects.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES core.workspaces(id),
    client_id UUID REFERENCES crm.clients(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active'
);

CREATE TABLE projects.project_context (
    project_id UUID PRIMARY KEY REFERENCES projects.projects(id) ON DELETE CASCADE,
    feasibility_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE projects.portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects.projects(id) ON DELETE SET NULL,
    cover_image_url TEXT,
    exported_stack JSONB NOT NULL DEFAULT '{}'::jsonb,
    public_slug VARCHAR(255) UNIQUE
);

-- ESQUEMA: agile
CREATE TABLE agile.epics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL
);

CREATE TABLE agile.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
    epic_id UUID REFERENCES agile.epics(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    bdd_criteria JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE agile.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
    story_id UUID REFERENCES agile.stories(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    assignee_id UUID REFERENCES core.users(id) ON DELETE SET NULL,
    lexicographical_rank VARCHAR(255) NOT NULL
);

CREATE TABLE agile.client_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES crm.clients(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    attachment_url TEXT,
    linked_ticket_id UUID REFERENCES agile.tickets(id) ON DELETE SET NULL
);

-- ESQUEMA: vault
CREATE TABLE vault.saved_stacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES core.workspaces(id),
    name VARCHAR(255) NOT NULL,
    tech_payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE vault.form_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES core.workspaces(id),
    schema_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ===============================================
-- 3. SEGURIDAD A NIVEL FILA (RLS - MUTLITENANCY)
-- ===============================================
-- Forzamos que cada consulta valide el "tenant_id" mediante una variable de sesión en Postgres
-- ej: SET app.current_tenant_id = 'xxxx-yyyy-zzzz';

ALTER TABLE crm.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.saved_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.form_templates ENABLE ROW LEVEL SECURITY;

-- Políticas de aislamiento directo (El registro debe tener el mismo tenant_id establecido en la sesión)
CREATE POLICY tenant_isolation_leads ON crm.leads
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_clients ON crm.clients
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_projects ON projects.projects
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_saved_stacks ON vault.saved_stacks
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_form_templates ON vault.form_templates
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Para las tablas 'agile' u otras que se conectan a 'projects', filtramos haciendo un JOIN virtual
ALTER TABLE agile.epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agile.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE agile.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_epics ON agile.epics
    USING (project_id IN (SELECT id FROM projects.projects WHERE tenant_id = current_setting('app.current_tenant_id')::UUID));

CREATE POLICY tenant_isolation_stories ON agile.stories
    USING (project_id IN (SELECT id FROM projects.projects WHERE tenant_id = current_setting('app.current_tenant_id')::UUID));

CREATE POLICY tenant_isolation_tickets ON agile.tickets
    USING (project_id IN (SELECT id FROM projects.projects WHERE tenant_id = current_setting('app.current_tenant_id')::UUID));
```

## User Review Required
> [!IMPORTANT]
> Revisá estos archivos y estructuras detenidamente. ¿Estás de acuerdo con este enfoque o preferís que ajustemos una ruta, entidad del SQL o capa de arquitectura en `.NET` antes de que pasemos a correr los comandos de andamiaje y creación del repo? Si me das luz verde, procedemos con los comandos físicos de creación.
