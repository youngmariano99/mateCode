import type { ErdTable } from '../schemas/projectImportSchemas';

/**
 * Interfaz maestra para todos los adaptadores de sincronización.
 */
export interface IErdAdapter {
    transform(rawData: any): ErdTable[];
}

/**
 * Adaptador para Supabase / PostgreSQL.
 * Mapea la estructura típica de introspección de esquemas.
 */
export class SupabaseAdapter implements IErdAdapter {
    transform(rawData: any): ErdTable[] {
        // Asumimos que rawData es un array de tablas desde una introspección de esquema
        if (!Array.isArray(rawData)) return [];

        return rawData.map(table => ({
            id: crypto.randomUUID(),
            nombre: table.name || table.table_name || 'Tabla_Sin_Nombre',
            descripcion: table.comment || table.description || '',
            columnas: (table.columns || []).map((col: any) => ({
                nombre: col.name || col.column_name,
                tipo: col.data_type || col.type || 'text',
                pk: col.is_primary_key || col.pk || false,
                fk: col.is_foreign_key || col.fk || false,
                nullable: col.is_nullable || col.nullable || true
            }))
        }));
    }
}

/**
 * Adaptador Genérico para APIs de Frameworks.
 * Intenta encontrar patrones comunes de esquemas.
 */
export class GenericApiAdapter implements IErdAdapter {
    transform(rawData: any): ErdTable[] {
        // Buscamos si la data viene en un nodo 'tables' o es el array raíz
        const tables = Array.isArray(rawData) ? rawData : (rawData.tables || rawData.data || []);
        
        return tables.map((table: any) => ({
            id: table.id || crypto.randomUUID(),
            nombre: table.nombre || table.name || table.tableName || 'Unknown',
            descripcion: table.descripcion || table.description || '',
            columnas: (table.columnas || table.columns || table.fields || []).map((f: any) => ({
                nombre: f.nombre || f.name || f.fieldName,
                tipo: f.tipo || f.type || f.dataType || 'string',
                pk: !!(f.pk || f.primaryKey || f.isPrimary),
                fk: !!(f.fk || f.foreignKey || f.isForeign),
                nullable: f.nullable !== false && f.isNullable !== false
            }))
        }));
    }
}

/**
 * Fábrica de Adaptadores.
 */
export const ErdAdapterFactory = {
    getAdapter(type: 'supabase' | 'custom'): IErdAdapter {
        switch (type) {
            case 'supabase': return new SupabaseAdapter();
            case 'custom': return new GenericApiAdapter();
            default: return new GenericApiAdapter();
        }
    }
};
