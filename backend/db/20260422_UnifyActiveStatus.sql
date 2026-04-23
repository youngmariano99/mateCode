-- MIGRACIÓN: UNIFICACIÓN DE LÓGICA "ACTIVO" PARA CATÁLOGOS
-- Fecha: 2026-04-22
-- Objetivo: Asegurar que tanto Estándares como Tecnologías usen la columna 'activo' para Soft Delete,
--           permitiendo mantener integridad en proyectos existentes aunque el elemento se quite del catálogo.

DO $$ 
BEGIN
    -- 1. Estándares: Agregar columna 'activo' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'boveda' AND table_name = 'estandares_catalogo' AND column_name = 'activo') THEN
        ALTER TABLE boveda.estandares_catalogo ADD COLUMN activo BOOLEAN DEFAULT TRUE;
    END IF;

    -- Sincronizar 'activo' con 'eliminado_en' (si ya había eliminados)
    UPDATE boveda.estandares_catalogo SET activo = FALSE WHERE eliminado_en IS NOT NULL;

    -- 2. Tecnologías: Asegurar que la columna 'activo' sea la estándar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'boveda' AND table_name = 'tecnologias_catalogo' AND column_name = 'activo') THEN
        ALTER TABLE boveda.tecnologias_catalogo ADD COLUMN activo BOOLEAN DEFAULT TRUE;
    END IF;

    -- 3. Limpieza de inconsistencias (Opcional: asegurar que todo lo nulo sea true)
    UPDATE boveda.estandares_catalogo SET activo = TRUE WHERE activo IS NULL;
    UPDATE boveda.tecnologias_catalogo SET activo = TRUE WHERE activo IS NULL;

END $$;
