-- ==================================================================================
-- SEED: PROYECTO QUANTUM-ERP (SaaS OMNICANAL HIGH-DENSITY)
-- Espacio de Trabajo: f91f9f65-54f6-4118-b942-5803af290e86
-- ==================================================================================

BEGIN;

DO $$ 
DECLARE 
    v_tenant_id uuid := 'f91f9f65-54f6-4118-b942-5803af290e86';
    v_user_id uuid := 'dcc056da-c08c-4fae-a5ca-28bab7ae00bf';
    v_project_id uuid := '77777777-7777-7777-7777-777777777777';
    v_lead_id uuid := '88888888-8888-8888-8888-888888888888';
    v_form_adn_id uuid := 'ca305201-621a-4d79-a697-1dbc1292b96f';
    
    -- Tech IDs
    v_tech_react uuid := '7ec410a0-0000-0000-0000-000000000001';
    v_tech_dotnet uuid := 'd07e7e7e-0000-0000-0000-000000000002';
    v_tech_pg uuid := '90579057-0000-0000-0000-000000000003';
    v_tech_redis uuid := '7ed157ed-0000-0000-0000-000000000004';
    v_tech_docker uuid := 'd0c4d0c4-0000-0000-0000-000000000005';
    v_tech_k8s uuid := '0b8e0b8e-0000-0000-0000-000000000006';
    v_tech_aws uuid := 'a255a255-0000-0000-0000-000000000007';

    -- Standard IDs
    v_std_clean uuid := '57da57da-0000-0000-0000-000000000001';
    v_std_solid uuid := '50110501-0000-0000-0000-000000000002';
    v_std_cqrs uuid := 'c975c975-0000-0000-0000-000000000003';
    v_std_3fn uuid := '33333333-0000-0000-0000-000000000004';
    v_std_patterns uuid := '9a779a77-0000-0000-0000-000000000005';

BEGIN
    -- 0. BIBLIOTECA DE FORMULARIOS: Asegurar plantilla ADN Maestra
    INSERT INTO crm.formularios_plantilla (id, tenant_id, nombre, tipo, configuracion_json, fecha_creacion)
    VALUES (v_form_adn_id, '00000000-0000-0000-0000-000000000000', 'Estructura ADN MateCode (Fase 0)', 'idea_propia', 
    '[
        {"pregunta": "Definición del Problema (¿Qué vamos a resolver?)", "tipo_input": "textarea", "etiqueta_semantica": "definicion_problema"}, 
        {"pregunta": "Mapa de Impacto (¿Por qué es importante?)", "tipo_input": "textarea", "etiqueta_semantica": "mapa_impacto"}, 
        {"pregunta": "Usuarios Contexto (¿Quiénes lo usarán?)", "tipo_input": "textarea", "etiqueta_semantica": "usuarios_contexto"}, 
        {"pregunta": "Procesos Actuales (¿Cómo se hace hoy?)", "tipo_input": "textarea", "etiqueta_semantica": "procesos_actuales"}, 
        {"pregunta": "Entidades Principales (¿Qué datos manejamos?)", "tipo_input": "textarea", "etiqueta_semantica": "entidades_clave"}, 
        {"pregunta": "KPIs de Éxito (¿Cómo medimos el triunfo?)", "tipo_input": "textarea", "etiqueta_semantica": "kpis"}, 
        {"pregunta": "Restricciones (Legales, Técnicas, Tiempos)", "tipo_input": "textarea", "etiqueta_semantica": "restricciones"}
    ]'::jsonb, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 1. CRM: Cliente Corporativo
    INSERT INTO crm.clientes (id, espacio_trabajo_id, nombre, email, estado, token_enlace_magico, contexto_json)
    VALUES (v_lead_id, v_tenant_id, 'Quantum Retail Group', 'ceo@quantum-retail.com', 'aprobado', 'quantum-magic-token', 
    '{
        "nombre": "Quantum Retail Group",
        "email": "ceo@quantum-retail.com",
        "presupuesto": 450000,
        "deadline": "2026-12-15",
        "descripcion": "Revolución digital para cadenas de retail masivas con enfoque en disponibilidad ultra-alta."
    }'::jsonb)
    ON CONFLICT (id) DO NOTHING;

    -- 2. PROYECTO: Ingeniería ADN Deep Dive
    INSERT INTO proyectos.proyectos (id, tenant_id, cliente_id, nombre, fase_actual, fecha_creacion, contexto_json)
    VALUES (v_project_id, v_tenant_id, v_lead_id, 'QuantumERP: Unified Commerce Engine', 'Fase 2 - Diseño', NOW(), 
    jsonb_build_object(
        'adn', jsonb_build_object(
            'plantillaId', v_form_adn_id,
            'data', jsonb_build_object(
                'definicion_problema', 'La empresa enfrenta una crisis de sincronización. Con 50 sucursales, el stock en la web no coincide con el físico, las ventas se duplican por errores de concurrencia y los gerentes no pueden ver el estado financiero consolidado sin esperar 48hs de procesos batch manuales. Necesitan un motor en tiempo real que maneje alta transaccionalidad sin degradar la performance.',
                'mapa_impacto', 'Buscamos una reducción del 95% en discrepancias de inventario, eliminar las ventas sin stock y proporcionar un dashboard ejecutivo con latencia de segundos. Esto permitirá a la empresa competir con gigantes como Amazon a nivel logístico regional.',
                'usuarios_contexto', '1. SuperAdministradores (Configuración SaaS y suscripciones). 2. Dueños de Franquicias (Multi-cuenta). 3. Gerentes Regionales. 4. Cajeros de POS (Venta rápida). 5. Personal de Depósito (Picking/Packing). 6. Clientes finales (Autogestión de pedidos).',
                'procesos_actuales', 'Actualmente usan un software desktop en cada sucursal que exporta CSVs por la noche a un servidor central. Si una sucursal se queda sin internet, los datos se pierden o se desfasan por días. No hay trazabilidad de quién modificó un precio o realizó una devolución sospechosa.',
                'entidades_clave', 'Tenants (Aislamiento lógico), Sucursales (Nodos de venta), Almacenes (Stocks vinculados), Catálogo Maestro de Productos, Esquemas de Precios Dinámicos, Movimientos de Caja (Inbound/Outbound), Auditoría (Logs de transacciones).',
                'kpis', 'Latencia de transacción POS < 200ms, Sincronización de stock global < 1s, Capacidad para procesar 10,000 pedidos por minuto, Disponibilidad 99.99% (Multi-AZ).',
                'restricciones', 'Cumplimiento estricto de GDPR/LGPD, Facturación Electrónica mediante APIs gubernamentales con timeouts de 5s, Aislamiento de base de datos para clientes Enterprise y alta resiliencia ante fallos de conectividad en locales físicos.'
            )
        )
    ))
    ON CONFLICT (id) DO NOTHING;

    -- 3. BÓVEDA: Tecnologías Avanzadas
    INSERT INTO boveda.tecnologias_catalogo (id, tenant_id, nombre, categoria_principal, categoria_secundaria, color_hex)
    VALUES 
    (v_tech_react, v_tenant_id, 'React 18 + Vite', 'Frontend', 'Framework', '#61dafb'),
    (v_tech_dotnet, v_tenant_id, '.NET 8 (C#)', 'Backend', 'Runtime', '#512bd4'),
    (v_tech_pg, v_tenant_id, 'PostgreSQL 15', 'Database', 'Relational', '#336791'),
    (v_tech_redis, v_tenant_id, 'Redis Distributed Cache', 'Cache', 'NoSQL', '#dc382d'),
    (v_tech_docker, v_tenant_id, 'Docker', 'DevOps', 'Containers', '#2496ed'),
    (v_tech_k8s, v_tenant_id, 'Kubernetes (EKS)', 'DevOps', 'Orchestration', '#326ce5'),
    (v_tech_aws, v_tenant_id, 'AWS (Cloud-Native)', 'Infrastructure', 'Cloud', '#ff9900')
    ON CONFLICT (id) DO NOTHING;

    -- 4. STACK: Vincular al Proyecto
    INSERT INTO proyectos.proyecto_stack (id, proyecto_id, tecnologia_id, descripcion_uso)
    VALUES 
    (gen_random_uuid(), v_project_id, v_tech_react, 'Micro-frontends para cada módulo del ERP (Ventas, Stock, Admin).'),
    (gen_random_uuid(), v_project_id, v_tech_dotnet, 'API Gateway y Microservicios siguiendo Clean Architecture y DDD.'),
    (gen_random_uuid(), v_project_id, v_tech_pg, 'Base de Datos principal con esquemas por tenant para aislamiento total.'),
    (gen_random_uuid(), v_project_id, v_tech_redis, 'Manejo de señales en tiempo real y bloqueo de stock distribuido.'),
    (gen_random_uuid(), v_project_id, v_tech_k8s, 'Despliegue escalable con auto-scaling basado en CPU y latencia.');

    -- 5. BÓVEDA: Estándares de Ingeniería Elite
    INSERT INTO boveda.estandares_catalogo (id, espacio_trabajo_id, categoria, nombre, descripcion_didactica, color_hex)
    VALUES 
    (v_std_clean, v_tenant_id, 'Arquitectura', 'Clean Architecture', 'Independencia de frameworks, UI y base de datos.', '#10b981'),
    (v_std_solid, v_tenant_id, 'Código', 'Principios SOLID', 'Código preparado para el cambio y fácil de testear.', '#3b82f6'),
    (v_std_cqrs, v_tenant_id, 'Patrones', 'CQRS + MediatR', 'Separación de lecturas y escrituras para máximo rendimiento.', '#8b5cf6'),
    (v_std_3fn, v_tenant_id, 'Base de Datos', 'Tercera Forma Normal (3FN)', 'Eliminación total de redundancia y anomalías de actualización.', '#f59e0b'),
    (v_std_patterns, v_tenant_id, 'Patrones GoF', 'Factory, Strategy & Observer', 'Uso de patrones creacionales y de comportamiento para extensibilidad.', '#ec4899')
    ON CONFLICT (id) DO NOTHING;

    -- 6. BLUEPRINT: Vincular estándares
    INSERT INTO proyectos.proyecto_estandar (proyecto_id, estandar_id)
    VALUES 
    (v_project_id, v_std_clean), (v_project_id, v_std_solid), 
    (v_project_id, v_std_cqrs), (v_project_id, v_std_3fn), (v_project_id, v_std_patterns)
    ON CONFLICT (proyecto_id, estandar_id) DO NOTHING;

    -- 7. FASE 1: Personas (Roles ERP)
    INSERT INTO agil.personas_proyecto (id, proyecto_id, nombre, rol)
    VALUES 
    (gen_random_uuid(), v_project_id, 'Super Administrador SaaS', 'Control de facturación de inquilinos, monitoreo de salud del sistema global.'),
    (gen_random_uuid(), v_project_id, 'Dueño de Empresa (Tenant)', 'Configuración de reglas de negocio, impuestos y sucursales propias.'),
    (gen_random_uuid(), v_project_id, 'Gerente de Sucursal', 'Auditoría de arqueos, gestión de incidencias de stock y personal local.'),
    (gen_random_uuid(), v_project_id, 'Cajero POS', 'Operación de alta velocidad, manejo de medios de pago y preventas.'),
    (gen_random_uuid(), v_project_id, 'Encargado de Logística', 'Recepción de mercadería, gestión de transferencias entre depósitos y picking.'),
    (gen_random_uuid(), v_project_id, 'Cliente B2B', 'Consulta de catálogo mayorista, descarga de facturas y tracking de pedidos.');

    -- 8. FASE 1: Historias de Usuario (Arquitectura Compleja)
    INSERT INTO agil.historias (id, proyecto_id, titulo, usuario_narrativo, criterios_bdd, prioridad)
    VALUES 
    (gen_random_uuid(), v_project_id, 'Venta con Stock Distribuido', 'Cajero POS', 'Dado que no hay stock local de una remera, cuando escaneo el producto, entonces el sistema me muestra disponibilidad en sucursales a 5km y permite la reserva inmediata.', 'Crítica'),
    (gen_random_uuid(), v_project_id, 'Aislamiento de Datos por Tenant', 'Sistema', 'Dado que existen múltiples empresas en el ERP, cuando se ejecuta un reporte, entonces la base de datos debe filtrar mediante Row Level Security para evitar fugas de información.', 'Crítica'),
    (gen_random_uuid(), v_project_id, 'Cierre de Caja y Arqueo Ciego', 'Gerente', 'Dado que el cajero declara el efectivo, cuando confirma el cierre, entonces el sistema compara con el valor teórico y genera una alerta si el desvío supera el 2%.', 'Alta'),
    (gen_random_uuid(), v_project_id, 'Sincronización Offline POS', 'Cajero POS', 'Dado que se corta la conexión a internet, cuando realizo una venta, entonces el sistema almacena el ticket localmente (PWA) y lo sincroniza automáticamente al recuperar señal.', 'Alta'),
    (gen_random_uuid(), v_project_id, 'Integración Facturación Electrónica', 'Sistema', 'Dado que se confirma el pago, cuando se emite el ticket, entonces el microservicio de impuestos debe firmar el documento digitalmente con el ente fiscal en menos de 3s.', 'MVP');

    -- 9. KANBAN: Columnas por defecto (Desarrollo)
    INSERT INTO proyectos.kanban_columnas (id, proyecto_id, tenant_id, nombre, orden_posicion)
    VALUES 
    (gen_random_uuid(), v_project_id, v_tenant_id, 'Por hacer', 0),
    (gen_random_uuid(), v_project_id, v_tenant_id, 'En progreso', 1),
    (gen_random_uuid(), v_project_id, v_tenant_id, 'Terminado', 2),
    (gen_random_uuid(), v_project_id, v_tenant_id, 'Aprobado', 3);

    RAISE NOTICE 'Seed Quantum-ERP ejecutado con éxito total.';

END $$;

COMMIT;

-- ==================================================================================
-- SCRIPT DE LIMPIEZA ACTUALIZADO
-- ==================================================================================
/*
BEGIN;
DELETE FROM agil.historias WHERE proyecto_id = '77777777-7777-7777-7777-777777777777';
DELETE FROM agil.personas_proyecto WHERE proyecto_id = '77777777-7777-7777-7777-777777777777';
DELETE FROM proyectos.kanban_columnas WHERE proyecto_id = '77777777-7777-7777-7777-777777777777';
DELETE FROM proyectos.proyecto_estandar WHERE proyecto_id = '77777777-7777-7777-7777-777777777777';
DELETE FROM proyectos.proyecto_stack WHERE proyecto_id = '77777777-7777-7777-7777-777777777777';
DELETE FROM proyectos.proyectos WHERE id = '77777777-7777-7777-7777-777777777777';
DELETE FROM crm.clientes WHERE id = '88888888-8888-8888-8888-888888888888';
COMMIT;
*/
