-- 1. Crear tabla de plantillas de prompts (si no existe)
CREATE TABLE IF NOT EXISTS boveda.plantillas_prompt (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, 
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    contenido_plantilla TEXT NOT NULL,
    fase_objetivo VARCHAR(100), -- 'Fase 2', 'Kanban', 'General'
    etiquetas JSONB DEFAULT '[]', 
    inyecta_adn BOOLEAN DEFAULT FALSE,
    inyecta_stack BOOLEAN DEFAULT FALSE,
    inyecta_bdd BOOLEAN DEFAULT FALSE,
    inyecta_ticket BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Limpiar semillas previas para evitar duplicados si se re-ejecuta
DELETE FROM boveda.plantillas_prompt WHERE tenant_id = '00000000-0000-0000-0000-000000000000';

-- 3. Semilla de Plantillas (Fase 2) con Ejemplos y Reglas Estrictas
INSERT INTO boveda.plantillas_prompt 
(tenant_id, titulo, descripcion, contenido_plantilla, fase_objetivo, etiquetas, inyecta_adn, inyecta_bdd)
VALUES 
('00000000-0000-0000-0000-000000000000', 
 'Arquitecto de Datos (DBML)', 
 'Genera el esquema de base de datos relacional basado en las necesidades del ADN y BDD.', 
 'Actúa como un Arquitecto de Base de Datos Senior.
Tu tarea es generar el Diagrama de Entidad-Relación (ERD) basándote en el siguiente contexto:

CONTEXTO ADN (FASE 0):
{ADN_AQUI}

HISTORIAS DE USUARIO (FASE 1):
{BDD_AQUI}

REGLAS ESTRICTAS DE SALIDA:
1. Escribe código estrictamente en formato DBML (Database Markup Language).
2. Usa tipos de datos SQL estándar (varchar, integer, uuid, boolean, timestamp).
3. Define las relaciones (1 a N, 1 a 1, N a N) usando la palabra clave Ref.
4. DEBES devolver ÚNICAMENTE el código en crudo, SIN bloques de markdown, SIN saludos.

PLANTILLA DE EJEMPLO ESPERADA:
Table usuarios {
  id uuid [primary key]
  email varchar
  creado_en timestamp
}
Table perfiles {
  id uuid [primary key]
  usuario_id uuid
  nombre varchar
}
Ref: usuarios.id < perfiles.usuario_id', 
 'Fase 2', 
 '["ERD", "DBML", "Database"]', 
 true, 
 true),

('00000000-0000-0000-0000-000000000000', 
 'Arquitecto UX (PlantUML Sitemap)', 
 'Define la navegación y jerarquía de pantallas del sistema.', 
 'Actúa como un Arquitecto UX/UI y Experto en Arquitectura de Información.
Tu tarea es generar el Sitemap (Mapa de Navegación) del sistema basándote en el siguiente contexto:

CONTEXTO ADN (FASE 0):
{ADN_AQUI}

HISTORIAS DE USUARIO (FASE 1):
{BDD_AQUI}

REGLAS ESTRICTAS DE SALICA:
1. Debes generar el código usando la sintaxis de "Mindmap" de PlantUML.
2. Agrupa por módulos principales y sub-páginas.
3. DEBES devolver ÚNICAMENTE el código en crudo. El primer caracter debe ser @.

PLANTILLA DE EJEMPLO ESPERADA:
@startmindmap
* Sistema Principal
** Autenticación
*** Iniciar Sesión
** Dashboard
*** Panel de Control
@endmindmap', 
 'Fase 2', 
 '["UX", "Sitemap", "PlantUML"]', 
 true, 
 true),

('00000000-0000-0000-0000-000000000000', 
 'Experto en Seguridad (Roles JSON)', 
 'Define la matriz de acceso RBAC según las interacciones descritas.', 
 'Actúa como un Arquitecto de Seguridad y Access Management.
Tu tarea es generar una Matriz de Roles y Permisos (RBAC) basándote en el siguiente contexto:

CONTEXTO ADN (FASE 0):
{ADN_AQUI}

HISTORIAS DE USUARIO (FASE 1):
{BDD_AQUI}

REGLAS ESTRICTAS DE SALIDA:
1. Identifica los roles necesarios a partir de las historias de usuario.
2. Asigna permisos atómicos a cada rol.
3. DEBES devolver ÚNICAMENTE un JSON válido.

PLANTILLA DE EJEMPLO ESPERADA:
{
  "roles": [
    {
      "nombre": "Administrador",
      "descripcion": "Acceso total",
      "permisos": ["gestionar_usuarios", "ver_reporte"]
    }
  ]
}', 
 'Fase 2', 
 '["Security", "Roles", "JSON"]', 
 true, 
 true);
