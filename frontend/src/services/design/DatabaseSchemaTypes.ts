export type DataFamily = 
  | 'integer'   // INT, SMALLINT, BIGINT
  | 'decimal'   // DECIMAL, FLOAT, MONEY, NUMBER
  | 'string'    // VARCHAR, CHAR, NVARCHAR
  | 'text'      // TEXT, CLOB, XMLTYPE
  | 'boolean'   // BOOLEAN, TINYINT(1)
  | 'datetime'  // DATE, TIMESTAMP, DATETIMEOFFSET, YEAR
  | 'binary'    // BLOB, BYTEA, RAW, BFILE
  | 'json'      // JSON, JSONB
  | 'spatial'   // GEOMETRY, GEOGRAPHY, SPATIAL
  | 'uuid'      // UUID, UNIQUEIDENTIFIER
  | 'array'     // ARRAY, SET
  | 'enum'      // ENUM
  | 'other';    // HSTORE, INTERVAL, etc.

export type DatabaseEngine = 'postgresql' | 'mysql' | 'sqlserver' | 'oracle' | 'mariadb' | 'sqlite';

export interface ColumnDef {
  name: string;
  data_family: DataFamily;
  native_type?: string;
  engine_overrides?: Partial<Record<DatabaseEngine, string>>;
  is_primary_key?: boolean;
  is_foreign_key?: boolean;
  is_nullable?: boolean;
  is_unique?: boolean;
  default_value?: string;
}

export interface TableDef {
  id: string; // Útil para React Flow
  name: string;
  schema?: string;
  columns: ColumnDef[];
  indexes?: { name: string; columns: string[]; is_unique: boolean }[];
  position?: { x: number; y: number };
}

export interface RelationDef {
  id: string;
  type: 'one_to_one' | 'one_to_many' | 'many_to_many';
  source_table: string;
  source_column: string;
  target_table: string;
  target_column: string;
  on_delete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

export interface UniversalDatabaseSchema {
  project_name: string;
  default_engine: DatabaseEngine;
  tables: TableDef[];
  relationships: RelationDef[];
}
