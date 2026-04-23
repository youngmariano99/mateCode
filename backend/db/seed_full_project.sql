-- ==================================================================================
-- SEED: PROYECTO COMPLETO (FASE 0 COMPLETADA)
-- Objetivo: Simular un proyecto que ya pasó por captura de Leads, 
-- Ingeniería ADN (Formulario completado), Selección de Stack y Blueprint.
-- ==================================================================================

BEGIN;

DO $$ 
DECLARE 
    v_tenant_id uuid := 'fd28f278-2186-4c84-9977-c1116c34de0b';
    v_user_id uuid := 'dcc056da-c08c-4fae-a5ca-28bab7ae00bf';
    v_project_id uuid := 'e7b8c2e1-4f1a-4d3e-9b6c-8a2f1e4d3c2b';
    v_lead_id uuid := 'c1a2d3e4-f5a6-b7c8-d9e0-f1a2b3c4d5e6';
    v_form_id uuid := 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1'; -- Formulario para el Lead
    v_form_adn_id uuid := 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'; -- Formulario de Ingeniería Interna
    v_tech_react uuid := '7ec410a0-0000-0000-0000-000000000001';
    v_tech_dotnet uuid := 'd07e7e7e-0000-0000-0000-000000000002';
    v_tech_pg uuid := '90579057-0000-0000-0000-000000000003';
    v_std_clean uuid := '57da57da-0000-0000-0000-000000000001';
    v_std_solid uuid := '50110501-0000-0000-0000-000000000002';

BEGIN
    -- 1. BIBLIOTECA DE FORMULARIOS: Crear plantillas
    INSERT INTO crm.formularios_plantilla (id, tenant_id, nombre, tipo, configuracion_json, fecha_creacion)
    VALUES 
    (v_form_id, v_tenant_id, 'Formulario de Ingeniería Senior', 'lead', 
    '[
        {"etiqueta_semantica": "presupuesto", "pregunta": "¿Cuál es el presupuesto estimado?", "tipo_input": "number"},
        {"etiqueta_semantica": "deadline", "pregunta": "¿Para cuándo lo necesitas?", "tipo_input": "date"},
        {"etiqueta_semantica": "descripcion", "pregunta": "Contanos brevemente la idea", "tipo_input": "textarea"}
    ]'::jsonb, NOW()),
    (v_form_adn_id, v_tenant_id, 'Modelo de Arquitectura MateCode', 'idea_propia', 
    '[
        {"etiqueta_semantica": "infraestructura", "pregunta": "Tipo de Infraestructura", "tipo_input": "text"},
        {"etiqueta_semantica": "escalabilidad", "pregunta": "Estrategia de Escalabilidad", "tipo_input": "textarea"},
        {"etiqueta_semantica": "seguridad", "pregunta": "Protocolos de Seguridad", "tipo_input": "textarea"}
    ]'::jsonb, NOW());

    -- 2. CRM: Crear el Lead capturado
    INSERT INTO crm.clientes (id, espacio_trabajo_id, nombre, email, estado, token_enlace_magico, contexto_json)
    VALUES (v_lead_id, v_tenant_id, 'Elon Musk Test', 'elon@tesla.com', 'aprobado', 'magic-test-token', 
    '{
        "nombre": "Elon Musk Test",
        "email": "elon@tesla.com",
        "presupuesto": 50000,
        "deadline": "2026-12-31",
        "descripcion": "Quiero una app para manejar colonias en Marte usando MateCode."
    }'::jsonb);

    -- 3. PROYECTO: Crear el proyecto con el ADN (Ingeniería) YA LLENO
    INSERT INTO proyectos.proyectos (id, tenant_id, cliente_id, nombre, fase_actual, fecha_creacion, contexto_json)
    VALUES (v_project_id, v_tenant_id, v_lead_id, 'Proyecto Marte: Colonización Digital', 'Fase 1 - Requisitos', NOW(), 
    jsonb_build_object(
        'adn', jsonb_build_object(
            'plantillaId', v_form_adn_id,
            'data', jsonb_build_object(
                'infraestructura', 'Cloud-Native (Multi-Region Mars/Earth)',
                'escalabilidad', 'Auto-scaling basado en población estacional de colonos.',
                'seguridad', 'Encriptación cuántica de grado militar para telemetría.'
            )
        )
    ));

    -- 4. BÓVEDA: Insertar Tecnologías en el Catálogo
    INSERT INTO boveda.tecnologias_catalogo (id, tenant_id, nombre, categoria_principal, categoria_secundaria, color_hex, fecha_creacion)
    VALUES 
    (v_tech_react, v_tenant_id, 'React.js', 'Frontend', 'Framework', '#61dafb', NOW()),
    (v_tech_dotnet, v_tenant_id, '.NET 8', 'Backend', 'Runtime', '#512bd4', NOW()),
    (v_tech_pg, v_tenant_id, 'PostgreSQL', 'Database', 'Relational', '#336791', NOW());

    -- 5. STACK: Vincular tecnologías al Proyecto
    INSERT INTO proyectos.proyecto_stack (id, proyecto_id, tecnologia_id, descripcion_uso)
    VALUES 
    (gen_random_uuid(), v_project_id, v_tech_react, 'Interfaz de usuario reactiva para domos espaciales'),
    (gen_random_uuid(), v_project_id, v_tech_dotnet, 'Core de procesamiento de oxígeno y telemetría'),
    (gen_random_uuid(), v_project_id, v_tech_pg, 'Persistencia de datos de colonos y recursos');

    -- 6. BÓVEDA: Insertar Estándares en el Catálogo
    INSERT INTO boveda.estandares_catalogo (id, espacio_trabajo_id, categoria, nombre, descripcion_didactica, color_hex)
    VALUES 
    (v_std_clean, v_tenant_id, 'Arquitectura', 'Clean Architecture', 'Mantené tu lógica de negocio pura, como el agua de los glaciares marciales.', '#10b981'),
    (v_std_solid, v_tenant_id, 'Código', 'Principios SOLID', 'Cinco mandamientos para que tu código no explote cuando el requerimiento cambie.', '#3b82f6');

    -- 7. BLUEPRINT: Vincular estándares al Proyecto
    INSERT INTO proyectos.proyecto_estandar (proyecto_id, estandar_id)
    VALUES 
    (v_project_id, v_std_clean),
    (v_project_id, v_std_solid);

    RAISE NOTICE 'Seed de Proyecto Completo ejecutado con éxito.';

END $$;

COMMIT;

-- ==================================================================================
-- SCRIPT DE LIMPIEZA (DROP / DELETE)
-- ==================================================================================
/*
BEGIN;
DELETE FROM proyectos.proyecto_estandar WHERE proyecto_id = 'e7b8c2e1-4f1a-4d3e-9b6c-8a2f1e4d3c2b';
DELETE FROM proyectos.proyecto_stack WHERE proyecto_id = 'e7b8c2e1-4f1a-4d3e-9b6c-8a2f1e4d3c2b';
DELETE FROM proyectos.proyectos WHERE id = 'e7b8c2e1-4f1a-4d3e-9b6c-8a2f1e4d3c2b';
DELETE FROM crm.clientes WHERE id = 'c1a2d3e4-f5a6-b7c8-d9e0-f1a2b3c4d5e6';
DELETE FROM crm.formularios_plantilla WHERE id IN ('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2');
DELETE FROM boveda.tecnologias_catalogo WHERE id IN ('7ec410a0-0000-0000-0000-000000000001', 'd07e7e7e-0000-0000-0000-000000000002', '90579057-0000-0000-0000-000000000003');
DELETE FROM boveda.estandares_catalogo WHERE id IN ('57da57da-0000-0000-0000-000000000001', '50110501-0000-0000-0000-000000000002');
COMMIT;
*/
