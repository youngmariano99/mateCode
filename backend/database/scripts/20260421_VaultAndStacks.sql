-- SCRIPT DE MIGRACIÓN MANUAL: BÓVEDA Y STACKS DINÁMICOS (VERSIÓN TAXONÓMICA SEGURA)
-- Fecha: 2026-04-21
-- Objetivo: Habilitar el catálogo de tecnologías con categorías principal/secundaria y permitir edición.

DO $$ 
BEGIN
    -- 1. Asegurar la existencia de los esquemas
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'boveda') THEN
        CREATE SCHEMA boveda;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'proyectos') THEN
        CREATE SCHEMA proyectos;
    END IF;

    -- 2. Tabla: Catálogo de Tecnologías (Evolución)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'boveda' AND table_name = 'tecnologias_catalogo') THEN
        CREATE TABLE boveda.tecnologias_catalogo (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID,
            nombre VARCHAR(100) NOT NULL,
            categoria_principal VARCHAR(100) NOT NULL,
            categoria_secundaria VARCHAR(100) NOT NULL,
            url_documentacion TEXT,
            color_hex VARCHAR(10) DEFAULT '#10B981',
            fecha_creacion TIMESTAMP DEFAULT NOW()
        );
    ELSE
        -- Si existe, renombramos y agregamos columnas
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'boveda' AND table_name = 'tecnologias_catalogo' AND column_name = 'categoria') THEN
            ALTER TABLE boveda.tecnologias_catalogo RENAME COLUMN categoria TO categoria_principal;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'boveda' AND table_name = 'tecnologias_catalogo' AND column_name = 'categoria_secundaria') THEN
            ALTER TABLE boveda.tecnologias_catalogo ADD COLUMN categoria_secundaria VARCHAR(100) DEFAULT 'Plataforma / Herramienta';
        END IF;
    END IF;

    -- 3. Tabla: Proyecto Stack
    CREATE TABLE IF NOT EXISTS proyectos.proyecto_stack (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        proyecto_id UUID NOT NULL REFERENCES proyectos.proyectos(id) ON DELETE CASCADE,
        tecnologia_id UUID NOT NULL REFERENCES boveda.tecnologias_catalogo(id),
        descripcion_uso TEXT
    );

    -- 4. Tabla: Plantillas de Stack (La Bóveda)
    CREATE TABLE IF NOT EXISTS boveda.plantillas_stack (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT,
        tecnologias_ids_json JSONB NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT NOW()
    );

    -- 5. Cargar / Actualizar Diccionario Maestro (UPSERT por Nombre)
    -- Esto asegura que no rompamos las FK de proyectos ya existentes.
    
    -- React
    INSERT INTO boveda.tecnologias_catalogo (nombre, categoria_principal, categoria_secundaria, color_hex)
    VALUES ('React', '🖥️ Frontend', 'Framework', '#61DAFB')
    ON CONFLICT (id) DO UPDATE SET categoria_principal = EXCLUDED.categoria_principal, categoria_secundaria = EXCLUDED.categoria_secundaria;

    -- .NET 9
    INSERT INTO boveda.tecnologias_catalogo (nombre, categoria_principal, categoria_secundaria, color_hex)
    VALUES ('.NET 9', '⚙️ Backend', 'Framework', '#512BD4')
    ON CONFLICT (id) DO UPDATE SET categoria_principal = EXCLUDED.categoria_principal, categoria_secundaria = EXCLUDED.categoria_secundaria;

    -- Los nuevos (si no existen se insertan)
    INSERT INTO boveda.tecnologias_catalogo (nombre, categoria_principal, categoria_secundaria, color_hex)
    VALUES 
    ('C#', '⚙️ Backend', 'Lenguaje', '#239120'),
    ('React-pdf', '🖥️ Frontend', 'Librería', '#FF4500'),
    ('PostgreSQL', '🗄️ Base de Datos', 'Motor DB', '#336791'),
    ('PostGIS', '🗄️ Base de Datos', 'Extensión / ORM', '#2767A5'),
    ('Entity Framework', '⚙️ Backend', 'Extensión / ORM', '#512BD4'),
    ('Docker', '☁️ Infra & DevOps', 'Plataforma / Herramienta', '#2496ED'),
    ('TypeScript', '🖥️ Frontend', 'Lenguaje', '#3178C6'),
    ('Zustand', '🖥️ Frontend', 'Librería', '#433929'),
    ('NestJS', '⚙️ Backend', 'Framework', '#E0234E'),
    ('Figma', '🎨 Diseño & UI', 'Plataforma / Herramienta', '#F24E1E')
    ON CONFLICT DO NOTHING;

    -- Actualización masiva de seguridad para lo que quedó sin categoría
    UPDATE boveda.tecnologias_catalogo SET categoria_principal = '⚙️ Backend' WHERE categoria_principal IS NULL OR categoria_principal = '';

END $$;
