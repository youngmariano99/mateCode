CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS nucleo;
CREATE SCHEMA IF NOT EXISTS crm;
CREATE SCHEMA IF NOT EXISTS proyectos;
CREATE SCHEMA IF NOT EXISTS agil;
CREATE SCHEMA IF NOT EXISTS finanzas;
CREATE SCHEMA IF NOT EXISTS boveda;

-- ====================================================================================
-- ESTRUCTURA COMPLETA (Para nuevas instalaciones)
-- ====================================================================================

-- NÚCLEO
CREATE TABLE IF NOT EXISTS nucleo.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nucleo.espacios_trabajo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    propietario_id UUID REFERENCES nucleo.usuarios(id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nucleo.miembros_espacio (
    espacio_trabajo_id UUID REFERENCES nucleo.espacios_trabajo(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES nucleo.usuarios(id) ON DELETE CASCADE,
    etiqueta_rol VARCHAR(100) NOT NULL,
    matriz_permisos JSONB NOT NULL DEFAULT '{}'::jsonb,
    PRIMARY KEY (espacio_trabajo_id, usuario_id)
);

-- CRM
CREATE TABLE IF NOT EXISTS crm.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    espacio_trabajo_id UUID REFERENCES nucleo.espacios_trabajo(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'potencial',
    token_enlace_magico VARCHAR(255) UNIQUE DEFAULT uuid_generate_v4()
);

-- PROYECTOS
CREATE TABLE IF NOT EXISTS proyectos.proyectos_activos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    espacio_trabajo_id UUID REFERENCES nucleo.espacios_trabajo(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES crm.clientes(id),
    nombre VARCHAR(255) NOT NULL,
    contexto_json JSONB DEFAULT '{}'::jsonb,
    fase_actual VARCHAR(50) DEFAULT 'factibilidad'
);

-- ÁGIL
CREATE TABLE IF NOT EXISTS agil.epicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID REFERENCES proyectos.proyectos_activos(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    rango_lexicografico VARCHAR(50) DEFAULT 'a'
);

CREATE TABLE IF NOT EXISTS agil.historias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    epica_id UUID REFERENCES agil.epicas(id) ON DELETE CASCADE,
    proyecto_id UUID REFERENCES proyectos.proyectos_activos(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    criterios_bdd TEXT,
    rango_lexicografico VARCHAR(50) DEFAULT 'a'
);

CREATE TABLE IF NOT EXISTS agil.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID REFERENCES proyectos.proyectos_activos(id) ON DELETE CASCADE,
    historia_id UUID REFERENCES agil.historias(id) ON DELETE SET NULL,
    tipo VARCHAR(50) DEFAULT 'Tarea',
    titulo VARCHAR(255) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Todo',
    responsable_id UUID,
    rango_lexicografico VARCHAR(50) DEFAULT 'a',
    especialidad VARCHAR(100)
);

-- FINANZAS
CREATE TABLE IF NOT EXISTS finanzas.perfiles_empresa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    espacio_trabajo_id UUID REFERENCES nucleo.espacios_trabajo(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255),
    colores_marca VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS finanzas.presupuestos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID REFERENCES proyectos.proyectos_activos(id) ON DELETE CASCADE,
    perfil_id UUID REFERENCES finanzas.perfiles_empresa(id),
    alcance_json JSONB DEFAULT '{}'::jsonb,
    monto_total DECIMAL(12,2)
);

-- BÓVEDA
CREATE TABLE IF NOT EXISTS boveda.plantillas_stack (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    espacio_trabajo_id UUID REFERENCES nucleo.espacios_trabajo(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    payload_tecnico JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS boveda.portafolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    espacio_trabajo_id UUID REFERENCES nucleo.espacios_trabajo(id) ON DELETE CASCADE,
    proyecto_original_id UUID,
    payload_limpio JSONB DEFAULT '{}'::jsonb
);

-- Habilitación de Row Level Security
DO $$ 
BEGIN
    ALTER TABLE crm.clientes ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
-- Repetir para el resto si es necesario, pero las políticas solo se crean si no existen

-- ====================================================================================
-- SCRIPTS DE MIGRACIÓN (EJECUTABLES)
-- ====================================================================================

-- 1. Asegurar esquema agil y finanzas
CREATE SCHEMA IF NOT EXISTS agil;
CREATE SCHEMA IF NOT EXISTS finanzas;
CREATE SCHEMA IF NOT EXISTS boveda;

CREATE TABLE IF NOT EXISTS finanzas.perfiles_empresa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    espacio_trabajo_id UUID REFERENCES nucleo.espacios_trabajo(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255),
    colores_marca VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS finanzas.presupuestos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID REFERENCES proyectos.proyectos(id) ON DELETE CASCADE, -- ¡CORREGIDO!
    perfil_id UUID REFERENCES finanzas.perfiles_empresa(id),
    alcance_json JSONB DEFAULT '{}'::jsonb,
    monto_total DECIMAL(12,2)
);

-- 2. Crear esquema y tabla de Bóveda (Fase 2)
CREATE SCHEMA IF NOT EXISTS boveda;

CREATE TABLE IF NOT EXISTS boveda.plantillas_stack (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    espacio_trabajo_id UUID REFERENCES nucleo.espacios_trabajo(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    payload_tecnico JSONB DEFAULT '{}'::jsonb
);

-- 3. Habilitar RLS
ALTER TABLE finanzas.perfiles_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas.presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE boveda.plantillas_stack ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS con la variable correcta
CREATE POLICY "aislamiento_tenant_perfiles" ON finanzas.perfiles_empresa FOR ALL USING (
    espacio_trabajo_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
);

CREATE POLICY "aislamiento_tenant_presupuestos" ON finanzas.presupuestos FOR ALL USING (
    proyecto_id IN (SELECT id FROM proyectos.proyectos WHERE tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
);

CREATE POLICY "aislamiento_tenant_boveda" ON boveda.plantillas_stack FOR ALL USING (
    espacio_trabajo_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
);