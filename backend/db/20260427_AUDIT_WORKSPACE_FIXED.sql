-- ========================================================
-- MIGRACIÓN: SISTEMA DE AUDITORÍA (CORRECCIÓN DE FK)
-- FECHA: 2026-04-27
-- DESCRIPCIÓN: Cambiando FK de Proyecto a Espacio de Trabajo.
-- ========================================================

-- Borramos las tablas viejas para recrearlas con la FK correcta
DROP TABLE IF EXISTS colab.log_actividad;
DROP TABLE IF EXISTS colab.mensajes_globales;

-- 1. TABLA DE MENSAJERÍA GLOBAL
CREATE TABLE colab.mensajes_globales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES nucleo.espacios_trabajo(id) ON DELETE CASCADE, -- Ahora apunta al Espacio de Trabajo
    usuario_id UUID NOT NULL,
    nombre_usuario VARCHAR(100),
    contenido TEXT NOT NULL,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE LOG DE ACTIVIDAD
CREATE TABLE colab.log_actividad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES nucleo.espacios_trabajo(id) ON DELETE CASCADE, -- Ahora apunta al Espacio de Trabajo
    usuario_id UUID NOT NULL,
    nombre_usuario VARCHAR(100),
    tipo_evento VARCHAR(50) NOT NULL, 
    detalles JSONB DEFAULT '{}'::jsonb,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_log_actividad_workspace_fecha ON colab.log_actividad(proyecto_id, fecha DESC);
CREATE INDEX idx_mensajes_globales_workspace_fecha ON colab.mensajes_globales(proyecto_id, fecha DESC);
