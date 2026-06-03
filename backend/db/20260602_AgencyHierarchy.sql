-- ====================================================================================
-- SPRINT: ADMINISTRACIÓN DE AGENCIA / EMPRESA
-- MIGRACIÓN DE JERARQUÍA Y NUEVOS MÓDULOS OPERATIVOS
-- ====================================================================================

CREATE SCHEMA IF NOT EXISTS organizacion;

-- 1. Tabla de Agencias/Empresas (Nivel jerárquico superior)
CREATE TABLE IF NOT EXISTS nucleo.agencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    propietario_id UUID REFERENCES nucleo.usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- 'personal' o 'agencia'
    llave_cifrado TEXT NOT NULL, -- Llave AES de la agencia, cifrada con la llave del entorno
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Modificación de Espacios de Trabajo para referenciar a su Agencia
ALTER TABLE nucleo.espacios_trabajo ADD COLUMN IF NOT EXISTS agencia_id UUID REFERENCES nucleo.agencias(id) ON DELETE CASCADE;

-- 3. Miembros de la Agencia con permisos granulares (Matriz de Acceso)
CREATE TABLE IF NOT EXISTS nucleo.miembros_agencia (
    agencia_id UUID REFERENCES nucleo.agencias(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES nucleo.usuarios(id) ON DELETE CASCADE,
    rol VARCHAR(100) NOT NULL, -- 'Propietario', 'Administrador', 'Colaborador'
    permisos_json JSONB NOT NULL DEFAULT '{}'::jsonb, -- Ej: { "crm": "write", "secrets": "none", "finances": "read", "workspaces": { "ws_id": "read" } }
    estado_invitacion VARCHAR(50) DEFAULT 'Pendiente',
    PRIMARY KEY (agencia_id, usuario_id)
);

-- 4. CRM: Clientes y Leads Calificados a nivel de Agencia
CREATE TABLE IF NOT EXISTS crm.leads_agencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agencia_id UUID REFERENCES nucleo.agencias(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    categoria VARCHAR(50) NOT NULL DEFAULT 'Lead', -- Lead, Llamada agendada, Propuesta enviada, Rechazado, Aceptado, Cerrado
    calificacion VARCHAR(50) NOT NULL DEFAULT 'Calificado', -- Calificado, No calificado
    origen_contacto VARCHAR(100), -- video, boca a boca, redes sociales, etc.
    motivo_contacto TEXT,
    descripcion TEXT,
    notas JSONB DEFAULT '[]'::jsonb,
    orden_posicion VARCHAR(50) DEFAULT 'a',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Objetivos por Usuario (Asignación cruzada)
CREATE TABLE IF NOT EXISTS organizacion.objetivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agencia_id UUID REFERENCES nucleo.agencias(id) ON DELETE CASCADE,
    usuario_asignado_id UUID REFERENCES nucleo.usuarios(id) ON DELETE CASCADE,
    creador_id UUID REFERENCES nucleo.usuarios(id) ON DELETE SET NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_periodo VARCHAR(50) NOT NULL, -- Diario, Semanal, Mensual, Trimestral, Anual
    fecha_limite DATE,
    completado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Recursos, Documentos y Prompts Compartidos
CREATE TABLE IF NOT EXISTS organizacion.recursos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agencia_id UUID REFERENCES nucleo.agencias(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT,
    tipo VARCHAR(50) NOT NULL, -- prompt, documento, template, otro
    etiquetas JSONB DEFAULT '[]'::jsonb,
    roles_permitidos JSONB DEFAULT '[]'::jsonb,
    creador_id UUID REFERENCES nucleo.usuarios(id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Planificación de Tareas Operativas (Extra-desarrollo, Kanban y Calendario)
CREATE TABLE IF NOT EXISTS organizacion.tareas_operativas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agencia_id UUID REFERENCES nucleo.agencias(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(50) DEFAULT 'Todo', -- Todo, In Progress, Done, Backlog
    fecha_planificada DATE, -- Para calendarización semanal/mensual
    usuario_asignado_id UUID REFERENCES nucleo.usuarios(id) ON DELETE SET NULL,
    rango_lexicografico VARCHAR(50) DEFAULT 'a',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Credenciales Seguras y Claves del Cliente Cifradas
CREATE TABLE IF NOT EXISTS organizacion.credenciales_seguras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agencia_id UUID REFERENCES nucleo.agencias(id) ON DELETE CASCADE,
    servicio VARCHAR(255) NOT NULL,
    usuario VARCHAR(255),
    clave_encriptada TEXT NOT NULL, -- AES-256
    url_acceso VARCHAR(255),
    roles_permitidos JSONB DEFAULT '[]'::jsonb,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Creación y Organización de Contenido por Miembro
CREATE TABLE IF NOT EXISTS organizacion.planificador_contenido (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agencia_id UUID REFERENCES nucleo.agencias(id) ON DELETE CASCADE,
    miembro_id UUID REFERENCES nucleo.usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    plataformas JSONB NOT NULL, -- ej: ["TikTok", "Instagram"]
    guion_plantilla TEXT,
    dialogo TEXT,
    procedimiento_estandar TEXT,
    estado VARCHAR(50) DEFAULT 'Idea', -- Idea, Guion, Grabado, Editado, Publicado
    notas_mejora TEXT,
    resumen_analitico JSONB DEFAULT '{}'::jsonb, -- Estadísticas semanales/mensuales
    fecha_publicacion DATE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Finanzas Corporativas (Ingresos, Egresos, Costos)
CREATE TABLE IF NOT EXISTS finanzas.transacciones_agencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agencia_id UUID REFERENCES nucleo.agencias(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- ingreso, egreso, costo_fijo, costo_variable
    monto DECIMAL(12,2) NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    categoria VARCHAR(100),
    proyecto_id UUID REFERENCES proyectos.proyectos(id) ON DELETE SET NULL, -- Opcional asociación a software
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Auditoría y Trazabilidad Inmutable
CREATE TABLE IF NOT EXISTS organizacion.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agencia_id UUID REFERENCES nucleo.agencias(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES nucleo.usuarios(id) ON DELETE CASCADE,
    nombre_usuario VARCHAR(255),
    modulo VARCHAR(100) NOT NULL, -- CRM, Accesos, Finanzas, etc.
    accion VARCHAR(50) NOT NULL, -- CREAR, MODIFICAR, ELIMINAR, LEER_ACCESO, etc.
    registro_id UUID,
    detalles JSONB DEFAULT '{}'::jsonb,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================================
-- MIGRACIÓN RETROCOMPATIBLE DE DATOS EXISTENTES
-- ====================================================================================
DO $$
DECLARE
    u_rec RECORD;
    new_agency_id UUID;
BEGIN
    FOR u_rec IN SELECT id, email, nombre_completo FROM nucleo.usuarios LOOP
        -- Generar ID de agencia único para este usuario
        new_agency_id := uuid_generate_v4();
        
        -- Insertar la Agencia Personal del usuario. Usamos un placeholder cifrado que luego el backend podrá manejar.
        -- "ZXZjX2tleV9wbGFjZWhvbGRlcg==" es un placeholder en base64 de 16 bytes para la llave aleatoria de la agencia.
        INSERT INTO nucleo.agencias (id, nombre, propietario_id, tipo, llave_cifrado)
        VALUES (new_agency_id, 'Agencia Personal de ' || u_rec.nombre_completo, u_rec.id, 'personal', 'ZXZjX2tleV9wbGFjZWhvbGRlcg==');
        
        -- Vincular los espacios de trabajo existentes del usuario a su nueva agencia personal
        UPDATE nucleo.espacios_trabajo
        SET agencia_id = new_agency_id
        WHERE propietario_id = u_rec.id;
    END LOOP;
END $$;
