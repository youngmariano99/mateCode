-- MIGRACIÓN VIRTUAL HQ 2.0
-- Clasificación de tickets para posicionamiento en la oficina virtual

ALTER TABLE agil.tickets 
ADD COLUMN IF NOT EXISTS especialidad TEXT; -- frontend, backend, qa, devops, infra

COMMENT ON COLUMN agil.tickets.especialidad IS 'Especialidad del ticket para determinar la zona de trabajo en el Virtual HQ';
