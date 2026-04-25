-- MIGRACIÓN VIRTUAL HQ
-- Agregar columna polimórfica a Decisiones para trazabilidad extendida

ALTER TABLE colab.decisiones 
ADD COLUMN IF NOT EXISTS elementos_relacionados JSONB DEFAULT '[]';

COMMENT ON COLUMN colab.decisiones.elementos_relacionados IS 'Lista de vinculaciones polimórficas (tickets, bugs, diagramas)';
