-- ========================================================
-- MIGRACIÓN: SISTEMA DE AUDITORÍA Y PERSISTENCIA GLOBAL (CORREGIDO)
-- FECHA: 2026-04-27
-- DESCRIPCIÓN: Tablas para chat global y log de actividad síncrona.
-- Referencia corregida al esquema 'proyectos'.
-- ========================================================

-- 1. TABLA DE MENSAJERÍA GLOBAL DEL ESPACIO DE TRABAJO
CREATE TABLE IF NOT EXISTS colab.mensajes_globales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES proyectos.proyectos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL, -- ID de Supabase Auth
    nombre_usuario VARCHAR(100),
    contenido TEXT NOT NULL,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE LOG DE ACTIVIDAD (CENTRO DE COMANDO)
CREATE TABLE IF NOT EXISTS colab.log_actividad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES proyectos.proyectos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL,
    nombre_usuario VARCHAR(100),
    tipo_evento VARCHAR(50) NOT NULL, 
    -- TIPOS: 'ENTRADA_SALA', 'SALIDA_SALA', 'INICIO_REUNION', 'FINAL_REUNION', 'VOTO_EMITIDO'
    detalles JSONB DEFAULT '{}'::jsonb,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_log_actividad_proyecto_fecha 
ON colab.log_actividad(proyecto_id, fecha DESC);

CREATE INDEX IF NOT EXISTS idx_mensajes_globales_proyecto_fecha 
ON colab.mensajes_globales(proyecto_id, fecha DESC);

-- 4. COMENTARIOS
COMMENT ON TABLE colab.mensajes_globales IS 'Historial de chat persistente para el Workspace 2D.';
COMMENT ON TABLE colab.log_actividad IS 'Audit trail de movimientos y eventos síncronos en el Command Center.';
