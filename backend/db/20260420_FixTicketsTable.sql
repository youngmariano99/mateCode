-- Script de sincronización para la tabla de tickets (Trinchera)
-- Este script asegura que los nombres de las columnas coincidan con el mapeo de AppDbContext

-- 1. Asegurar que existe el esquema
CREATE SCHEMA IF NOT EXISTS agil;

-- 2. Corregir tabla agil.tickets si ya existe
DO $$ 
BEGIN
    -- Si existe 'title' pero no 'titulo', renombrar
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'agil' AND table_name = 'tickets' AND column_name = 'title') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'agil' AND table_name = 'tickets' AND column_name = 'titulo') THEN
        ALTER TABLE agil.tickets RENAME COLUMN title TO titulo;
    END IF;

    -- Si no existe 'titulo' (ni como 'title'), crearlo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'agil' AND table_name = 'tickets' AND column_name = 'titulo') THEN
        ALTER TABLE agil.tickets ADD COLUMN titulo VARCHAR(255) NOT NULL DEFAULT 'Sin título';
    END IF;

    -- Corregir 'status' a 'estado'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'agil' AND table_name = 'tickets' AND column_name = 'status') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'agil' AND table_name = 'tickets' AND column_name = 'estado') THEN
        ALTER TABLE agil.tickets RENAME COLUMN status TO estado;
    END IF;

    -- Corregir 'lexicographical_rank' a 'rango_lexicografico'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'agil' AND table_name = 'tickets' AND column_name = 'lexicographical_rank') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'agil' AND table_name = 'tickets' AND column_name = 'rango_lexicografico') THEN
        ALTER TABLE agil.tickets RENAME COLUMN lexicographical_rank TO rango_lexicografico;
    END IF;

    -- Corregir 'assignee_id' a 'responsable_id'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'agil' AND table_name = 'tickets' AND column_name = 'assignee_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'agil' AND table_name = 'tickets' AND column_name = 'responsable_id') THEN
        ALTER TABLE agil.tickets RENAME COLUMN assignee_id TO responsable_id;
    END IF;

END $$;

-- 3. Asegurar que la tabla historias también tenga los nombres correctos
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'agil' AND table_name = 'historias' AND column_name = 'title') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'agil' AND table_name = 'historias' AND column_name = 'titulo') THEN
        ALTER TABLE agil.historias RENAME COLUMN title TO titulo;
    END IF;
END $$;
