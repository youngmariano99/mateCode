-- ====================================================================================
-- Script: Fase 3 - Modulo DevHub (Colaboración, Pizarras y Búsqueda Vectorial)
-- ====================================================================================

CREATE SCHEMA IF NOT EXISTS colab;

-- 1. Tabla de Decisiones (ADRs)
CREATE TABLE IF NOT EXISTS colab.decisiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES proyectos.proyectos(id) ON DELETE CASCADE,
    creador_id UUID NOT NULL REFERENCES nucleo.usuarios(id),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'Propuesto', -- Propuesto, Aceptado, Rechazado
    etiquetas JSONB DEFAULT '[]',
    elementos_relacionados JSONB DEFAULT '[]',
    vector_busqueda TSVECTOR,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Votos de Decisiones
CREATE TABLE IF NOT EXISTS colab.votos_decision (
    decision_id UUID NOT NULL REFERENCES colab.decisiones(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES nucleo.usuarios(id) ON DELETE CASCADE,
    es_upvote BOOLEAN NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (decision_id, usuario_id)
);

-- 3. Tabla de Bugs (Inteligente)
CREATE TABLE IF NOT EXISTS colab.bugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES proyectos.proyectos(id) ON DELETE CASCADE,
    reportador_id UUID NOT NULL REFERENCES nucleo.usuarios(id),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    pasos_reproduccion TEXT,
    estado VARCHAR(50) DEFAULT 'Abierto', -- Abierto, Convertido, Resuelto
    ticket_asociado_id UUID, -- Si se convirtió a Ticket, se guarda la ref
    vector_busqueda TSVECTOR,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Pizarras (tldraw)
CREATE TABLE IF NOT EXISTS colab.pizarras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES proyectos.proyectos(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    documento_json JSONB NOT NULL DEFAULT '{}',
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================================
-- TRIGGERS DE BÚSQUEDA FULL-TEXT (TSVECTOR)
-- ====================================================================================

-- Función para actualizar el vector de decisiones
CREATE OR REPLACE FUNCTION colab.actualizar_vector_decision() RETURNS trigger AS $$
BEGIN
  NEW.vector_busqueda :=
    setweight(to_tsvector('spanish', coalesce(NEW.titulo, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(NEW.descripcion, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce((NEW.etiquetas)::text, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_actualizar_vector_decision
  BEFORE INSERT OR UPDATE ON colab.decisiones
  FOR EACH ROW EXECUTE FUNCTION colab.actualizar_vector_decision();

-- Función para actualizar el vector de bugs
CREATE OR REPLACE FUNCTION colab.actualizar_vector_bug() RETURNS trigger AS $$
BEGIN
  NEW.vector_busqueda :=
    setweight(to_tsvector('spanish', coalesce(NEW.titulo, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(NEW.descripcion, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(NEW.pasos_reproduccion, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_actualizar_vector_bug
  BEFORE INSERT OR UPDATE ON colab.bugs
  FOR EACH ROW EXECUTE FUNCTION colab.actualizar_vector_bug();

-- ====================================================================================
-- INDICES GIN PARA ACELERAR BÚSQUEDA
-- ====================================================================================
CREATE INDEX IF NOT EXISTS idx_decisiones_vector ON colab.decisiones USING GIN (vector_busqueda);
CREATE INDEX IF NOT EXISTS idx_bugs_vector ON colab.bugs USING GIN (vector_busqueda);

-- ====================================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================================
ALTER TABLE colab.decisiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE colab.votos_decision ENABLE ROW LEVEL SECURITY;
ALTER TABLE colab.bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE colab.pizarras ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "aislamiento_tenant_colab_dec" ON colab.decisiones FOR ALL USING (
        proyecto_id IN (SELECT id FROM proyectos.proyectos WHERE tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "aislamiento_tenant_colab_bugs" ON colab.bugs FOR ALL USING (
        proyecto_id IN (SELECT id FROM proyectos.proyectos WHERE tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "aislamiento_tenant_colab_pizarras" ON colab.pizarras FOR ALL USING (
        proyecto_id IN (SELECT id FROM proyectos.proyectos WHERE tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
