-- AÑADIR COLUMNA DE DESCRIPCIÓN A REUNIONES
ALTER TABLE colab.reuniones ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- OPCIONAL: Si queremos que el acta sea obligatoria con un default vacío
ALTER TABLE colab.reuniones ALTER COLUMN acta_json SET DEFAULT '{}'::jsonb;
