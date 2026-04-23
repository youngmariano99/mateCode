-- ====================================================================================
-- SPRINT 5: REFINAMIENTO - ARCHITECTURAL BLUEPRINT
-- ====================================================================================

-- 1. Catálogo de Estándares (Bóveda)
CREATE TABLE IF NOT EXISTS boveda.estandares_catalogo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    espacio_trabajo_id UUID REFERENCES nucleo.espacios_trabajo(id) ON DELETE CASCADE,
    categoria VARCHAR(100) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion_didactica TEXT,
    color_hex VARCHAR(7) DEFAULT '#10B981',
    eliminado_en TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 2. Relación Proyecto - Estándar
DROP TABLE IF EXISTS proyectos.proyecto_estandar CASCADE;
CREATE TABLE proyectos.proyecto_estandar (
    proyecto_id UUID REFERENCES proyectos.proyectos(id) ON DELETE CASCADE,
    estandar_id UUID REFERENCES boveda.estandares_catalogo(id) ON DELETE CASCADE,
    PRIMARY KEY (proyecto_id, estandar_id)
);

-- 3. Habilitar RLS
ALTER TABLE boveda.estandares_catalogo ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
-- Nota: Se asume que app.current_tenant_id se setea en la sesión.
-- Filtramos por el espacio de trabajo actual y que NO esté eliminado (Soft Delete).
DROP POLICY IF EXISTS "aislamiento_tenant_estandares" ON boveda.estandares_catalogo;
CREATE POLICY "aislamiento_tenant_estandares" ON boveda.estandares_catalogo FOR ALL USING (
    (espacio_trabajo_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid OR espacio_trabajo_id IS NULL)
    AND eliminado_en IS NULL
);

-- 5. Semilla (Seed Data)
-- Insertamos algunos estándares globales (espacio_trabajo_id IS NULL)
INSERT INTO boveda.estandares_catalogo (categoria, nombre, descripcion_didactica, color_hex) 
VALUES 
('Seguridad', 'JWT ECC P-256', 'Autenticación asimétrica moderna. Alta seguridad con llaves elípticas.', '#EF4444'),
('Seguridad', 'RLS Nativo', 'Row-Level Security en PostgreSQL para aislamiento multitenant real.', '#F59E0B'),
('Arquitectura', 'Clean Architecture', 'Separación de capas (Core, App, Infra, API) para mantenibilidad.', '#10B981'),
('Arquitectura', 'CQS Patterns', 'Separación estricta entre lectura y escritura de datos.', '#3B82F6'),
('Testing', 'Unit Testing xUnit', 'Pruebas unitarias automáticas para lógica de negocio.', '#6366F1'),
('Testing', 'Cypress E2E', 'Pruebas de punta a punta simulando navegación de usuario real.', '#A855F7'),
('UX/UI', 'Zinc Dark Mode', 'Interfaz oscura premium usando escala de grises Zinc.', '#3F3F46'),
('UX/UI', 'Emerald Accents', 'Uso de verde esmeralda para acciones principales y éxito.', '#10B981')
ON CONFLICT DO NOTHING;
