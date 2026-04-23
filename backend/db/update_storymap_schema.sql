-- ==================================================================================
-- ACTUALIZACIÓN DE ESQUEMA: STORY MAPPING MULTIDIMENSIONAL (PATTON STYLE)
-- ==================================================================================

BEGIN;

-- 1. RELEASES (Eje Vertical / Swimlanes)
CREATE TABLE IF NOT EXISTS agil.releases (
    id UUID PRIMARY KEY,
    proyecto_id UUID NOT NULL REFERENCES proyectos.proyectos(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    orden_posicion INT DEFAULT 0,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PERSONAS (Roles de Usuario)
CREATE TABLE IF NOT EXISTS agil.personas_proyecto (
    id UUID PRIMARY KEY,
    proyecto_id UUID NOT NULL REFERENCES proyectos.proyectos(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FEATURES (Pasos específicos / Columnas)
CREATE TABLE IF NOT EXISTS agil.features (
    id UUID PRIMARY KEY,
    epica_id UUID NOT NULL REFERENCES agil.epicas(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    color_hex TEXT,
    orden_posicion INT DEFAULT 0
);

-- 4. ACTUALIZAR EPICAS
ALTER TABLE agil.epicas ADD COLUMN IF NOT EXISTS color_hex TEXT;
ALTER TABLE agil.epicas ADD COLUMN IF NOT EXISTS orden_posicion INT DEFAULT 0;

-- 5. ACTUALIZAR HISTORIAS (Link a Feature y Release)
ALTER TABLE agil.historias ADD COLUMN IF NOT EXISTS feature_id UUID REFERENCES agil.features(id) ON DELETE CASCADE;
ALTER TABLE agil.historias ADD COLUMN IF NOT EXISTS release_id UUID REFERENCES agil.releases(id) ON DELETE SET NULL;
ALTER TABLE agil.historias ADD COLUMN IF NOT EXISTS criterios_aceptacion JSONB; -- Lista de checks

-- Asegurar tipos de columnas existentes
ALTER TABLE agil.historias ALTER COLUMN criterios_bdd TYPE TEXT USING criterios_bdd::TEXT;

COMMIT;
