# Especificación Técnica: Módulo "Motor ERD Universal" (Fase 2)

## 1. Visión General
El diseñador de Base de Datos operará bajo el patrón de "AST JSON Bidireccional con Data Families". El diagrama visual es una representación reactiva de un JSON. Esto permite soportar cualquier tipo de dato complejo de PostgreSQL, MySQL, SQL Server, Oracle y SQLite sin romper la interfaz gráfica.

## 2. El Contrato de Datos (UniversalSchema AST)
Para soportar todos los tipos de datos nativos sin romper la UI, dividimos el tipado en `data_family` (para renderizar íconos visuales) y `engine_overrides` (para la inyección de DDL exacto).

```typescript
// Define la categoría visual (El ícono que mostrará React Flow)
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
  data_family: DataFamily; // Para la UI
  native_type?: string;    // El tipo nativo genérico sugerido (Ej: 'VARCHAR(255)')
  engine_overrides?: Partial<Record<DatabaseEngine, string>>; // Los tipos exactos de tu lista
  is_primary_key?: boolean;
  is_foreign_key?: boolean;
  is_nullable?: boolean;
  is_unique?: boolean;
  default_value?: string;
}

export interface TableDef {
  name: string;
  schema?: string;
  columns: ColumnDef[];
  indexes?: { name: string; columns: string[]; is_unique: boolean }[];
}

export interface RelationDef {
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

3. Ejemplos de Mapeo de Tipos Complejos (Referencia para la IA)
Cuando la IA o el usuario genere columnas complejas, debe usar el engine_overrides de esta manera:

Dinero: { data_family: 'decimal', engine_overrides: { sqlserver: 'MONEY', postgresql: 'NUMERIC(19,4)' } }

Mapas (Spatial): { data_family: 'spatial', engine_overrides: { postgresql: 'GEOMETRY', oracle: 'SPATIAL', sqlserver: 'GEOGRAPHY' } }

Textos Largos: { data_family: 'text', engine_overrides: { oracle: 'CLOB', sqlserver: 'NVARCHAR(MAX)' } }

Listas/Arrays: { data_family: 'array', engine_overrides: { postgresql: 'TEXT[]', mysql: 'SET' } }

4. Lógica de UI/UX (React Flow)
Lienzo Gráfico: El TableNode de React Flow lee el data_family para poner un ícono lindo al lado del nombre de la columna (Ej: 🌐 para spatial, 📅 para datetime). Al lado, en texto pequeño gris, muestra el native_type o el override del motor seleccionado.

Formulario de Columna: Al agregar una columna, el usuario elige primero la DataFamily en un dropdown simple. Opcionalmente, puede abrir un panel "Avanzado" donde puede tipear a mano el tipo exacto en engine_overrides si necesita algo extremadamente específico de Oracle o SQL Server.


---

### 🧠 ¿Por qué esto es indestructible?
Fijate el ejemplo de **Dinero**. 
En tu pantalla de React Flow, la columna se va a ver así: `[ 🔢 saldo ]`. Simple, limpio y sin romper la caja del diagrama.
Pero cuando le des al botón de "Exportar a SQL Server", el backend va a leer el `engine_overrides` y va a escribir:
`saldo MONEY NOT NULL`

Y si le decís "Mejor pasalo a Postgres", va a escribir:
`saldo NUMERIC(19,4) NOT NULL`

¡Con este documento actualizado, tu IA del IDE ya tiene la matriz completa para programarlo sin dejarse ningún tipo de dato afuera! ¿Qué te parece esta estructura de "Familia + Override"?