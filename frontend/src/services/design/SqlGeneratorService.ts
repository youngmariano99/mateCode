import type { UniversalDatabaseSchema, DatabaseEngine, ColumnDef, TableDef } from './DatabaseSchemaTypes';

export class SqlGeneratorService {
    /**
     * Genera el DDL completo para el motor objetivo.
     */
    static generateDDL(schema: UniversalDatabaseSchema, targetEngine: DatabaseEngine): string {
        let sql = `-- DDL Generado por MateCode Universal ERD\n`;
        sql += `-- Proyecto: ${schema.project_name}\n`;
        sql += `-- Motor: ${targetEngine.toUpperCase()}\n\n`;

        // 1. Generar Tablas
        schema.tables.forEach(table => {
            sql += this.generateCreateTable(table, targetEngine);
            sql += '\n';
        });

        // 2. Generar Relaciones (Foreign Keys)
        schema.relationships.forEach(rel => {
            sql += this.generateForeignKey(rel, targetEngine);
        });

        return sql;
    }

    private static generateCreateTable(table: TableDef, engine: DatabaseEngine): string {
        let sql = `CREATE TABLE ${table.name} (\n`;
        
        const columnDefinitions = table.columns.map(col => {
            const type = this.resolveType(col, engine);
            const nullable = col.is_nullable ? '' : ' NOT NULL';
            const pk = col.is_primary_key && engine === 'sqlite' ? ' PRIMARY KEY' : ''; // SQLite prefiere PK en línea
            const defValue = col.default_value ? ` DEFAULT ${col.default_value}` : '';
            
            return `    ${col.name} ${type}${nullable}${defValue}${pk}`;
        });

        sql += columnDefinitions.join(',\n');

        // Claves Primarias (si no es SQLite o si hay múltiples)
        const pks = table.columns.filter(c => c.is_primary_key).map(c => c.name);
        if (pks.length > 0 && engine !== 'sqlite') {
            sql += `,\n    CONSTRAINT PK_${table.name} PRIMARY KEY (${pks.join(', ')})`;
        }

        sql += `\n);`;
        return sql;
    }

    private static generateForeignKey(rel: any, engine: DatabaseEngine): string {
        // Formato estándar ANSI SQL
        return `ALTER TABLE ${rel.source_table} ADD CONSTRAINT FK_${rel.source_table}_${rel.target_table} \n` +
               `FOREIGN KEY (${rel.source_column}) REFERENCES ${rel.target_table}(${rel.target_column});\n\n`;
    }

    private static resolveType(col: ColumnDef, engine: DatabaseEngine): string {
        // 1. Prioridad: Override específico del motor
        if (col.engine_overrides && col.engine_overrides[engine]) {
            return col.engine_overrides[engine]!;
        }

        // 2. Fallback: Mapeo por DataFamily si no hay native_type o override
        const familyMap: Record<string, Record<DatabaseEngine, string>> = {
            integer: { postgresql: 'INTEGER', mysql: 'INT', sqlserver: 'INT', oracle: 'NUMBER', mariadb: 'INT', sqlite: 'INTEGER' },
            decimal: { postgresql: 'NUMERIC(19,4)', mysql: 'DECIMAL(19,4)', sqlserver: 'DECIMAL(19,4)', oracle: 'NUMBER', mariadb: 'DECIMAL', sqlite: 'REAL' },
            string: { postgresql: 'VARCHAR(255)', mysql: 'VARCHAR(255)', sqlserver: 'NVARCHAR(255)', oracle: 'VARCHAR2(255)', mariadb: 'VARCHAR(255)', sqlite: 'TEXT' },
            text: { postgresql: 'TEXT', mysql: 'LONGTEXT', sqlserver: 'NVARCHAR(MAX)', oracle: 'CLOB', mariadb: 'LONGTEXT', sqlite: 'TEXT' },
            boolean: { postgresql: 'BOOLEAN', mysql: 'TINYINT(1)', sqlserver: 'BIT', oracle: 'NUMBER(1)', mariadb: 'TINYINT(1)', sqlite: 'INTEGER' },
            datetime: { postgresql: 'TIMESTAMP', mysql: 'DATETIME', sqlserver: 'DATETIME2', oracle: 'DATE', mariadb: 'DATETIME', sqlite: 'TEXT' },
            uuid: { postgresql: 'UUID', mysql: 'CHAR(36)', sqlserver: 'UNIQUEIDENTIFIER', oracle: 'RAW(16)', mariadb: 'CHAR(36)', sqlite: 'TEXT' },
            json: { postgresql: 'JSONB', mysql: 'JSON', sqlserver: 'NVARCHAR(MAX)', oracle: 'CLOB', mariadb: 'JSON', sqlite: 'TEXT' }
        };

        const familyDefaults = familyMap[col.data_family];
        if (familyDefaults && familyDefaults[engine]) {
            return familyDefaults[engine];
        }

        return col.native_type || 'VARCHAR(255)';
    }
}
