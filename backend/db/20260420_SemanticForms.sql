-- Refinamiento #3: Motor de Captación y Formularios Semánticos

-- 1. Crear esquema CRM si no existe (por seguridad)
CREATE SCHEMA IF NOT EXISTS crm;

-- 2. Tabla de Plantillas de Formularios
CREATE TABLE IF NOT EXISTS crm.formularios_plantilla (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, -- 000..00 para globales
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'lead', 'idea_propia'
    configuracion_json JSONB NOT NULL, -- Array de objetos {pregunta, tipo_input, etiqueta_semantica}
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Habilitar RLS
ALTER TABLE crm.formularios_plantilla ENABLE ROW LEVEL SECURITY;

-- 4. Semillas (Globales)
DELETE FROM crm.formularios_plantilla WHERE tenant_id = '00000000-0000-0000-0000-000000000000';

INSERT INTO crm.formularios_plantilla (tenant_id, nombre, tipo, configuracion_json)
VALUES 
('00000000-0000-0000-0000-000000000000', 
 'Calificación BANT (Ventas)', 
 'lead', 
 '[
    {"pregunta": "¿Cuál es el presupuesto estimado para este proyecto?", "tipo_input": "number", "etiqueta_semantica": "presupuesto"},
    {"pregunta": "¿Quién es el responsable de la toma de decisiones?", "tipo_input": "text", "etiqueta_semantica": "autoridad"},
    {"pregunta": "¿Qué problema crítico necesitan resolver?", "tipo_input": "textarea", "etiqueta_semantica": "definicion_problema"},
    {"pregunta": "¿Para cuándo necesitan tener la solución operativa?", "tipo_input": "date", "etiqueta_semantica": "restricciones"}
 ]'::jsonb),

('00000000-0000-0000-0000-000000000000', 
 'Estructura ADN MateCode (Fase 0)', 
 'idea_propia', 
 '[
    {"pregunta": "Definición del Problema (¿Qué vamos a resolver?)", "tipo_input": "textarea", "etiqueta_semantica": "definicion_problema"},
    {"pregunta": "Mapa de Impacto (¿Por qué es importante?)", "tipo_input": "textarea", "etiqueta_semantica": "mapa_impacto"},
    {"pregunta": "Usuarios Contexto (¿Quiénes lo usarán?)", "tipo_input": "textarea", "etiqueta_semantica": "usuarios_contexto"},
    {"pregunta": "Procesos Actuales (¿Cómo se hace hoy?)", "tipo_input": "textarea", "etiqueta_semantica": "procesos_actuales"},
    {"pregunta": "Entidades Principales (¿Qué datos manejamos?)", "tipo_input": "textarea", "etiqueta_semantica": "entidades_clave"},
    {"pregunta": "KPIs de Éxito (¿Cómo medimos el triunfo?)", "tipo_input": "textarea", "etiqueta_semantica": "kpis"},
    {"pregunta": "Restricciones (Legales, Técnicas, Tiempos)", "tipo_input": "textarea", "etiqueta_semantica": "restricciones"}
 ]'::jsonb);
