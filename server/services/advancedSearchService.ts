import { Pool } from 'pg';
import { pool, readOnlyPool } from '../db';

export interface TableMetadata {
  tableName: string;
  columns: ColumnMetadata[];
  recordCount: number;
  sampleValues: Record<string, any[]>;
}

export interface ColumnMetadata {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  defaultValue: string | null;
  maxLength: number | null;
}

export interface SearchFilter {
  column: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 
            'greater_than' | 'less_than' | 'greater_or_equal' | 'less_or_equal' | 
            'is_null' | 'is_not_null' | 'in' | 'not_in' | 'between';
  value?: any; // Optional since some operators like is_null don't need a value
  value2?: any; // For 'between' operator
}

export interface SearchQuery {
  table: string;
  filters: SearchFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  database?: 'main' | 'readonly';
}

export interface SearchResult {
  data: any[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class AdvancedSearchService {
  /**
   * Get all tables from a database
   */
  async getTables(database: 'main' | 'readonly' = 'main'): Promise<string[]> {
    const dbPool = database === 'main' ? pool : readOnlyPool;
    
    try {
      const result = await dbPool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `);
      
      return result.rows.map(row => row.table_name);
    } catch (error) {
      console.error('Error getting tables:', error);
      throw new Error('Failed to get tables');
    }
  }

  /**
   * Get metadata for a specific table
   */
  async getTableMetadata(tableName: string, database: 'main' | 'readonly' = 'main'): Promise<TableMetadata> {
    const dbPool = database === 'main' ? pool : readOnlyPool;
    
    try {
      // Get column information
      const columnsResult = await dbPool.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      const columns: ColumnMetadata[] = columnsResult.rows.map(row => ({
        columnName: row.column_name,
        dataType: row.data_type,
        isNullable: row.is_nullable === 'YES',
        defaultValue: row.column_default,
        maxLength: row.character_maximum_length
      }));

      // Get record count
      const countResult = await dbPool.query(`
        SELECT COUNT(*) as count FROM "${tableName}";
      `);
      const recordCount = parseInt(countResult.rows[0]?.count || '0');

      // Get sample distinct values for each column (limited to 20 per column)
      const sampleValues: Record<string, any[]> = {};
      
      for (const column of columns) {
        try {
          // Only get samples for certain data types and non-encrypted columns
          if (column.dataType.includes('text') || 
              column.dataType.includes('char') || 
              column.dataType.includes('integer') ||
              column.dataType.includes('boolean')) {
            
            // Skip encrypted or sensitive columns
            if (column.columnName.includes('encrypted') || 
                column.columnName.includes('password') ||
                column.columnName.includes('token')) {
              continue;
            }

            const sampleResult = await dbPool.query(`
              SELECT DISTINCT "${column.columnName}" 
              FROM "${tableName}" 
              WHERE "${column.columnName}" IS NOT NULL 
              LIMIT 20;
            `);
            
            sampleValues[column.columnName] = sampleResult.rows.map(row => row[column.columnName]);
          }
        } catch (error) {
          // Skip columns that can't be sampled
          console.log(`Skipping sample for ${column.columnName}`);
        }
      }

      return {
        tableName,
        columns,
        recordCount,
        sampleValues
      };
    } catch (error) {
      console.error(`Error getting metadata for table ${tableName}:`, error);
      throw new Error(`Failed to get metadata for table ${tableName}`);
    }
  }

  /**
   * Get all tables with their metadata
   */
  async getAllTablesMetadata(database: 'main' | 'readonly' = 'main'): Promise<TableMetadata[]> {
    try {
      const tables = await this.getTables(database);
      const metadata: TableMetadata[] = [];

      for (const table of tables) {
        try {
          const tableMeta = await this.getTableMetadata(table, database);
          metadata.push(tableMeta);
        } catch (error) {
          console.error(`Error getting metadata for ${table}:`, error);
        }
      }

      return metadata;
    } catch (error) {
      console.error('Error getting all tables metadata:', error);
      throw new Error('Failed to get tables metadata');
    }
  }

  /**
   * Validate identifier (table or column name) to prevent SQL injection
   */
  private validateIdentifier(identifier: string): boolean {
    // Only allow alphanumeric, underscores, and hyphens
    return /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(identifier);
  }

  /**
   * Safely quote identifier
   */
  private quoteIdentifier(identifier: string): string {
    if (!this.validateIdentifier(identifier)) {
      throw new Error(`Invalid identifier: ${identifier}`);
    }
    return `"${identifier}"`;
  }

  /**
   * Build WHERE clause from filters with validation
   */
  private async buildWhereClause(
    filters: SearchFilter[], 
    tableName: string, 
    validColumns: Set<string>
  ): Promise<{ clause: string; values: any[] }> {
    if (filters.length === 0) {
      return { clause: '', values: [] };
    }

    // Validate table name
    if (!this.validateIdentifier(tableName)) {
      throw new Error('Invalid table name');
    }

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const filter of filters) {
      // Validate column exists in metadata
      if (!validColumns.has(filter.column)) {
        throw new Error(`Invalid column: ${filter.column}`);
      }

      const column = `${this.quoteIdentifier(tableName)}.${this.quoteIdentifier(filter.column)}`;

      switch (filter.operator) {
        case 'equals':
          conditions.push(`${column} = $${paramIndex}`);
          values.push(filter.value);
          paramIndex++;
          break;

        case 'not_equals':
          conditions.push(`${column} != $${paramIndex}`);
          values.push(filter.value);
          paramIndex++;
          break;

        case 'contains':
          conditions.push(`${column}::text ILIKE $${paramIndex}`);
          values.push(`%${filter.value}%`);
          paramIndex++;
          break;

        case 'not_contains':
          conditions.push(`${column}::text NOT ILIKE $${paramIndex}`);
          values.push(`%${filter.value}%`);
          paramIndex++;
          break;

        case 'starts_with':
          conditions.push(`${column}::text ILIKE $${paramIndex}`);
          values.push(`${filter.value}%`);
          paramIndex++;
          break;

        case 'ends_with':
          conditions.push(`${column}::text ILIKE $${paramIndex}`);
          values.push(`%${filter.value}`);
          paramIndex++;
          break;

        case 'greater_than':
          conditions.push(`${column} > $${paramIndex}`);
          values.push(filter.value);
          paramIndex++;
          break;

        case 'less_than':
          conditions.push(`${column} < $${paramIndex}`);
          values.push(filter.value);
          paramIndex++;
          break;

        case 'greater_or_equal':
          conditions.push(`${column} >= $${paramIndex}`);
          values.push(filter.value);
          paramIndex++;
          break;

        case 'less_or_equal':
          conditions.push(`${column} <= $${paramIndex}`);
          values.push(filter.value);
          paramIndex++;
          break;

        case 'is_null':
          conditions.push(`${column} IS NULL`);
          break;

        case 'is_not_null':
          conditions.push(`${column} IS NOT NULL`);
          break;

        case 'in':
          if (Array.isArray(filter.value) && filter.value.length > 0) {
            const placeholders = filter.value.map((_, idx) => `$${paramIndex + idx}`).join(', ');
            conditions.push(`${column} IN (${placeholders})`);
            values.push(...filter.value);
            paramIndex += filter.value.length;
          }
          break;

        case 'not_in':
          if (Array.isArray(filter.value) && filter.value.length > 0) {
            const placeholders = filter.value.map((_, idx) => `$${paramIndex + idx}`).join(', ');
            conditions.push(`${column} NOT IN (${placeholders})`);
            values.push(...filter.value);
            paramIndex += filter.value.length;
          }
          break;

        case 'between':
          conditions.push(`${column} BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
          values.push(filter.value, filter.value2);
          paramIndex += 2;
          break;
      }
    }

    return {
      clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      values
    };
  }

  /**
   * Execute advanced search query with validation
   */
  async search(query: SearchQuery): Promise<SearchResult> {
    const dbPool = query.database === 'main' ? pool : readOnlyPool;
    const page = query.page || 1;
    const pageSize = Math.min(query.pageSize || 50, 1000); // Max 1000 results per page
    const offset = (page - 1) * pageSize;

    try {
      // Validate table name
      if (!this.validateIdentifier(query.table)) {
        throw new Error('Invalid table name');
      }

      // Get table metadata to validate columns
      const metadata = await this.getTableMetadata(query.table, query.database);
      const validColumns = new Set(metadata.columns.map(col => col.columnName));

      // Validate sort column if provided
      if (query.sortBy && !validColumns.has(query.sortBy)) {
        throw new Error(`Invalid sort column: ${query.sortBy}`);
      }

      // Validate sort order
      if (query.sortOrder && !['asc', 'desc'].includes(query.sortOrder)) {
        throw new Error('Invalid sort order');
      }

      // Build WHERE clause with validation
      const { clause: whereClause, values: whereValues } = await this.buildWhereClause(
        query.filters, 
        query.table,
        validColumns
      );

      // Build ORDER BY clause safely
      const orderByClause = query.sortBy 
        ? `ORDER BY ${this.quoteIdentifier(query.table)}.${this.quoteIdentifier(query.sortBy)} ${query.sortOrder === 'desc' ? 'DESC' : 'ASC'}`
        : '';

      // Get total count with validated identifiers
      const countQuery = `
        SELECT COUNT(*) as count 
        FROM ${this.quoteIdentifier(query.table)} 
        ${whereClause};
      `;
      const countResult = await dbPool.query(countQuery, whereValues);
      const totalCount = parseInt(countResult.rows[0]?.count || '0');

      // Get paginated data with validated identifiers
      const dataQuery = `
        SELECT * 
        FROM ${this.quoteIdentifier(query.table)} 
        ${whereClause}
        ${orderByClause}
        LIMIT $${whereValues.length + 1} OFFSET $${whereValues.length + 2};
      `;
      const dataResult = await dbPool.query(dataQuery, [...whereValues, pageSize, offset]);

      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: dataResult.rows,
        totalCount,
        page,
        pageSize,
        totalPages
      };
    } catch (error) {
      console.error('Error executing search:', error);
      throw new Error('Failed to execute search query');
    }
  }

  /**
   * Export search results to CSV
   */
  async exportToCSV(query: SearchQuery): Promise<string> {
    try {
      // Execute search without pagination limit
      const result = await this.search({
        ...query,
        page: 1,
        pageSize: 10000 // Export max 10k records at once
      });

      if (result.data.length === 0) {
        return '';
      }

      // Build CSV
      const headers = Object.keys(result.data[0]);
      const csvRows = [headers.join(',')];

      for (const row of result.data) {
        const values = headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          
          const stringValue = String(value);
          // Escape values containing comma, quote, or newline
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        });
        csvRows.push(values.join(','));
      }

      return csvRows.join('\n');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw new Error('Failed to export data');
    }
  }
}

export const advancedSearchService = new AdvancedSearchService();
