-- ====================================================================================
-- Script: Fase 3 - Sprints y Backlog Inteligente
-- ====================================================================================

-- 1. Crear tabla Sprints
CREATE TABLE IF NOT EXISTS agil.sprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID REFERENCES proyectos.proyectos(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    objetivo TEXT,
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(50) DEFAULT 'Planificado'
);

-- 2. Alterar tabla Tickets para incluir soporte a IA y Cycle Time
DO $$
BEGIN
    ALTER TABLE agil.tickets ADD COLUMN sprint_id UUID REFERENCES agil.sprints(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE agil.tickets ADD COLUMN origen_historia_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE agil.tickets ADD COLUMN epic_tag VARCHAR(150);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE agil.tickets ADD COLUMN prioridad VARCHAR(50) DEFAULT 'MVP';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE agil.tickets ADD COLUMN criterios_json JSONB;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE agil.tickets ADD COLUMN tareas_json JSONB;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE agil.tickets ADD COLUMN fecha_inicio_real TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE agil.tickets ADD COLUMN fecha_fin_real TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 3. Crear tabla Métricas Sprint
CREATE TABLE IF NOT EXISTS agil.metricas_sprint (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sprint_id UUID REFERENCES agil.sprints(id) ON DELETE CASCADE,
    tickets_completados INT DEFAULT 0,
    tickets_incompletos INT DEFAULT 0,
    promedio_cycle_time_horas DECIMAL(10,2) DEFAULT 0,
    notas_retrospectiva TEXT,
    fecha_cierre TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Habilitar RLS
ALTER TABLE agil.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE agil.metricas_sprint ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "aislamiento_tenant_sprints" ON agil.sprints FOR ALL USING (
        proyecto_id IN (SELECT id FROM proyectos.proyectos WHERE tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "aislamiento_tenant_metricas" ON agil.metricas_sprint FOR ALL USING (
        sprint_id IN (
            SELECT id FROM agil.sprints WHERE proyecto_id IN (
                SELECT id FROM proyectos.proyectos WHERE tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            )
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
