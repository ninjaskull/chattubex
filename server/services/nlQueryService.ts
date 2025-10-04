import { Pool } from 'pg';
import { readOnlyDb, readOnlyPool, pool as writePool } from '../db';
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
  isAmbiguous?: boolean;
  clarifyingQuestions?: string[];
  userFriendlyIntent?: string;
}

interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  rowCount?: number;
  executionTime?: number;
  insights?: string[];
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
   * Analyze natural language query with enhanced intent interpretation
   * Detects ambiguity and generates clarifying questions
   */
  async analyzeQueryEnhanced(userQuery: string): Promise<QueryIntent> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    // Get database schema
    const schemas = await this.getDatabaseSchema();
    const schemaSummary = this.generateSchemaSummary(schemas);

    const systemPrompt = `You are Duggu, an intelligent data analyst assistant. Your job is to help users explore their database safely and effectively.

${schemaSummary}

Your task:
1. Interpret the user's question and explain what you understood in a friendly, conversational way
2. Detect if the query is ambiguous or lacks specifics
3. Generate a PostgreSQL SELECT query (read-only operations ONLY)
4. Provide clarifying questions if the query is ambiguous

Rules:
- ONLY generate SELECT queries - never INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, or any write operations
- Use LIMIT clause (default 100 unless user specifies)
- Use proper JOINs, WHERE clauses, and aggregate functions when appropriate
- Be conversational and friendly in explanations

Return JSON with this structure:
{
  "userFriendlyIntent": "A friendly explanation like 'It looks like you're asking for...'",
  "intent": "technical description",
  "confidence": 0-100,
  "isAmbiguous": true/false,
  "clarifyingQuestions": ["question 1", "question 2"] (only if isAmbiguous is true),
  "suggestedSQL": "the SQL query" (only if not ambiguous or confidence > 60),
  "explanation": "what the query does in plain English",
  "tablesInvolved": ["table1", "table2"],
  "isReadOnly": true
}

Ambiguity indicators:
- Missing time ranges (e.g., "recent", "this month" without current date context)
- Vague quantities (e.g., "many", "few")
- Unclear filters (e.g., "active users" if no status column exists)
- Multiple possible interpretations

If confidence < 60, set isAmbiguous to true and provide clarifying questions.`;

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
      if (queryIntent.suggestedSQL && !this.isReadOnlyQuery(queryIntent.suggestedSQL)) {
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
   * Analyze natural language query and generate SQL (original method maintained for compatibility)
   */
  async analyzeQuery(userQuery: string): Promise<QueryIntent> {
    return this.analyzeQueryEnhanced(userQuery);
  }

  /**
   * Validate that a SQL query is read-only
   * Uses comprehensive checks to prevent write operations
   */
  private isReadOnlyQuery(sql: string): boolean {
    const upperSQL = sql.trim().toUpperCase();
    
    // List of write operations that are forbidden
    const writeKeywords = [
      'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 
      'TRUNCATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE',
      'CALL', 'MERGE', 'REPLACE', 'RENAME', 'SET', 'COPY'
    ];

    // Check for write keywords anywhere in the query (not just at start)
    // This catches CTEs with writes: WITH x AS (UPDATE ...) SELECT ...
    for (const keyword of writeKeywords) {
      // Use word boundaries to avoid false positives
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(sql)) {
        return false;
      }
    }

    // Query must start with SELECT or WITH for CTEs
    // But we already checked that WITH doesn't contain write operations above
    if (!upperSQL.startsWith('SELECT') && !upperSQL.startsWith('WITH')) {
      return false;
    }

    // Check for multiple statements (semicolon-separated)
    // Only allow if all are SELECT/WITH
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    if (statements.length > 1) {
      // Multiple statements not allowed for safety
      return false;
    }

    return true;
  }

  /**
   * Generate insights from query results using AI
   */
  async generateInsights(data: any[], userQuery: string, sql: string): Promise<string[]> {
    if (!this.openai || !data || data.length === 0) {
      return [];
    }

    try {
      // Prepare data summary for AI
      const rowCount = data.length;
      const columnNames = Object.keys(data[0] || {});
      const sampleRows = data.slice(0, 5);
      
      // Calculate basic statistics
      const stats: any = {};
      for (const col of columnNames) {
        const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined);
        const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
        
        if (numericValues.length > 0) {
          stats[col] = {
            count: numericValues.length,
            sum: numericValues.reduce((a, b) => a + b, 0),
            avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
            min: Math.min(...numericValues),
            max: Math.max(...numericValues)
          };
        }
      }

      const systemPrompt = `You are Duggu, an intelligent data analyst. Generate 3-5 concise, actionable insights from query results.

User's question: "${userQuery}"
SQL executed: ${sql}
Rows returned: ${rowCount}
Columns: ${columnNames.join(', ')}
Sample data: ${JSON.stringify(sampleRows)}
Statistics: ${JSON.stringify(stats)}

Generate insights that:
1. Summarize key findings (totals, counts, trends)
2. Highlight interesting patterns or outliers
3. Answer the user's original question
4. Are specific and data-driven
5. Are easy to understand

Return a JSON array of insight strings: ["insight 1", "insight 2", ...]
Maximum 5 insights, each under 100 characters.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate insights from this data.' }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const result = JSON.parse(content);
      return result.insights || result.data || [];
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }

  /**
   * Execute a read-only SQL query with transaction-level enforcement and generate insights
   */
  async executeQuery(sql: string, userQuery?: string): Promise<QueryResult> {
    // Double-check that query is read-only
    if (!this.isReadOnlyQuery(sql)) {
      return {
        success: false,
        error: 'Only SELECT queries are allowed for security reasons'
      };
    }

    const startTime = Date.now();
    const client = await readOnlyPool.connect();

    try {
      // Use PostgreSQL's transaction-level read-only enforcement
      await client.query('BEGIN TRANSACTION READ ONLY');
      
      const result = await client.query(sql);
      
      await client.query('COMMIT');
      
      const executionTime = Date.now() - startTime;

      // Generate insights if we have data and a user query
      let insights: string[] = [];
      if (result.rows && result.rows.length > 0 && userQuery) {
        insights = await this.generateInsights(result.rows, userQuery, sql);
      }

      return {
        success: true,
        data: result.rows,
        rowCount: result.rowCount || 0,
        executionTime,
        insights
      };
    } catch (error: any) {
      // Rollback on error
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
      
      console.error('Error executing query:', error);
      return {
        success: false,
        error: error.message || 'Query execution failed'
      };
    } finally {
      client.release();
    }
  }

  /**
   * Store query feedback for learning
   * Uses write-capable pool for INSERT operations
   */
  async storeFeedback(
    userQuery: string,
    generatedSQL: string,
    wasAccurate: boolean,
    userFeedback?: string
  ): Promise<void> {
    try {
      // Store in ai_interactions table for learning - use write pool for INSERT
      await writePool.query(`
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
      
      console.log('Query feedback stored successfully');
    } catch (error) {
      console.error('Error storing feedback:', error);
      // Re-throw to surface the error for monitoring
      throw new Error(`Failed to store feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
