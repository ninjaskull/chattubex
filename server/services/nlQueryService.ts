import { Pool } from 'pg';
import { readOnlyDb, readOnlyPool } from '../db';
import OpenAI from 'openai';

interface TableSchema {
  tableName: string;
  columns: {
    name: string;
    type: string;
    nullable: string;
    default: string | null;
  }[];
  sampleData?: any[];
  recordCount?: number;
}

interface QueryIntent {
  intent: string;
  confidence: number;
  suggestedSQL: string;
  explanation: string;
  tablesInvolved: string[];
  isReadOnly: boolean;
}

interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  rowCount?: number;
  executionTime?: number;
}

/**
 * Natural Language Query Service
 * Enables AI-powered database querying with natural language
 * All queries are strictly read-only for data safety
 */
export class NLQueryService {
  private openai: OpenAI | null = null;
  private schemaCache: Map<string, TableSchema> = new Map();
  private schemaCacheTime: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Get all table schemas from the database
   */
  async getDatabaseSchema(refresh: boolean = false): Promise<TableSchema[]> {
    const now = Date.now();
    
    // Return cached schema if still valid
    if (!refresh && this.schemaCache.size > 0 && (now - this.schemaCacheTime) < this.CACHE_TTL) {
      return Array.from(this.schemaCache.values());
    }

    try {
      // Get all tables
      const tablesResult = await readOnlyPool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `);

      const tables = tablesResult.rows.map(row => row.table_name);
      const schemas: TableSchema[] = [];

      for (const tableName of tables) {
        try {
          // Get column information
          const columnsResult = await readOnlyPool.query(`
            SELECT 
              column_name as name,
              data_type as type,
              is_nullable as nullable,
              column_default as default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1
            ORDER BY ordinal_position;
          `, [tableName]);

          // Get record count
          const countResult = await readOnlyPool.query(`
            SELECT COUNT(*) as count FROM "${tableName}";
          `);

          // Get sample data (3 rows max)
          const sampleResult = await readOnlyPool.query(`
            SELECT * FROM "${tableName}" LIMIT 3;
          `);

          const tableSchema: TableSchema = {
            tableName,
            columns: columnsResult.rows,
            sampleData: sampleResult.rows,
            recordCount: parseInt(countResult.rows[0]?.count || '0')
          };

          schemas.push(tableSchema);
          this.schemaCache.set(tableName, tableSchema);
        } catch (error) {
          console.error(`Error getting schema for table ${tableName}:`, error);
        }
      }

      this.schemaCacheTime = now;
      return schemas;
    } catch (error) {
      console.error('Error getting database schema:', error);
      throw new Error('Failed to retrieve database schema');
    }
  }

  /**
   * Generate a schema summary for AI context
   */
  private generateSchemaSummary(schemas: TableSchema[]): string {
    let summary = "Database Schema:\n\n";
    
    for (const schema of schemas) {
      summary += `Table: ${schema.tableName} (${schema.recordCount || 0} records)\n`;
      summary += "Columns:\n";
      
      for (const col of schema.columns) {
        summary += `  - ${col.name}: ${col.type}`;
        if (col.nullable === 'NO') summary += ' NOT NULL';
        if (col.default) summary += ` DEFAULT ${col.default}`;
        summary += '\n';
      }
      
      if (schema.sampleData && schema.sampleData.length > 0) {
        summary += `Sample data: ${JSON.stringify(schema.sampleData[0])}\n`;
      }
      
      summary += '\n';
    }
    
    return summary;
  }

  /**
   * Analyze natural language query and generate SQL
   */
  async analyzeQuery(userQuery: string): Promise<QueryIntent> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    // Get database schema
    const schemas = await this.getDatabaseSchema();
    const schemaSummary = this.generateSchemaSummary(schemas);

    const systemPrompt = `You are a SQL expert assistant that converts natural language queries into PostgreSQL SELECT queries.

${schemaSummary}

Important Rules:
1. Generate ONLY read-only SELECT queries - never INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, or any write operations
2. Use proper PostgreSQL syntax
3. Include appropriate JOINs when querying related tables
4. Use LIMIT clause to prevent returning too many rows (default 100 unless user specifies)
5. Use proper WHERE clauses for filtering
6. Use aggregate functions (COUNT, SUM, AVG, etc.) when appropriate
7. Return valid JSON with the following structure:
{
  "intent": "brief description of what the user wants",
  "confidence": 0-100 (how confident you are in understanding the query),
  "suggestedSQL": "the generated SQL query",
  "explanation": "plain English explanation of what the query does",
  "tablesInvolved": ["array", "of", "table", "names"],
  "isReadOnly": true (MUST always be true)
}

If the user asks for a write operation, set isReadOnly to false and explain that only read operations are allowed.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const queryIntent: QueryIntent = JSON.parse(content);
      
      // Validate that the query is read-only
      if (!this.isReadOnlyQuery(queryIntent.suggestedSQL)) {
        queryIntent.isReadOnly = false;
        queryIntent.explanation = 'This query contains write operations which are not allowed. Only SELECT queries are permitted.';
      }

      return queryIntent;
    } catch (error) {
      console.error('Error analyzing query:', error);
      throw new Error('Failed to analyze query');
    }
  }

  /**
   * Validate that a SQL query is read-only
   */
  private isReadOnlyQuery(sql: string): boolean {
    const upperSQL = sql.trim().toUpperCase();
    
    // List of write operations that are forbidden
    const writeKeywords = [
      'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 
      'TRUNCATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE',
      'CALL', 'MERGE', 'REPLACE', 'RENAME'
    ];

    for (const keyword of writeKeywords) {
      // Check if the keyword appears at the start or after semicolon
      if (upperSQL.startsWith(keyword) || 
          upperSQL.includes(`;${keyword}`) || 
          upperSQL.includes(`; ${keyword}`)) {
        return false;
      }
    }

    // Must start with SELECT or WITH (for CTEs)
    return upperSQL.startsWith('SELECT') || upperSQL.startsWith('WITH');
  }

  /**
   * Execute a read-only SQL query
   */
  async executeQuery(sql: string): Promise<QueryResult> {
    // Double-check that query is read-only
    if (!this.isReadOnlyQuery(sql)) {
      return {
        success: false,
        error: 'Only SELECT queries are allowed for security reasons'
      };
    }

    const startTime = Date.now();

    try {
      const result = await readOnlyPool.query(sql);
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result.rows,
        rowCount: result.rowCount || 0,
        executionTime
      };
    } catch (error: any) {
      console.error('Error executing query:', error);
      return {
        success: false,
        error: error.message || 'Query execution failed'
      };
    }
  }

  /**
   * Store query feedback for learning
   */
  async storeFeedback(
    userQuery: string,
    generatedSQL: string,
    wasAccurate: boolean,
    userFeedback?: string
  ): Promise<void> {
    try {
      // Store in ai_interactions table for learning
      await readOnlyPool.query(`
        INSERT INTO ai_interactions (
          user_message, 
          ai_response, 
          intent, 
          confidence,
          feedback,
          context
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        userQuery,
        generatedSQL,
        'database_query',
        wasAccurate ? 100 : 50,
        userFeedback || (wasAccurate ? 'accurate' : 'inaccurate'),
        JSON.stringify({ queryType: 'nl_to_sql', timestamp: new Date().toISOString() })
      ]);
    } catch (error) {
      console.error('Error storing feedback:', error);
      // Don't throw - feedback storage shouldn't break the main flow
    }
  }

  /**
   * Get query suggestions based on schema
   */
  async getQuerySuggestions(): Promise<string[]> {
    const schemas = await this.getDatabaseSchema();
    const suggestions: string[] = [];

    for (const schema of schemas) {
      if (schema.recordCount && schema.recordCount > 0) {
        suggestions.push(`Show me all ${schema.tableName}`);
        suggestions.push(`How many ${schema.tableName} are there?`);
        
        // Add suggestions based on column types
        const textColumns = schema.columns.filter(c => 
          c.type.includes('text') || c.type.includes('varchar')
        );
        
        if (textColumns.length > 0) {
          suggestions.push(`Search ${schema.tableName} by ${textColumns[0].name}`);
        }
      }
    }

    return suggestions.slice(0, 10); // Return top 10 suggestions
  }
}

export const nlQueryService = new NLQueryService();
