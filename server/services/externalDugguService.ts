import { Pool } from '@neondatabase/serverless';
import ws from "ws";
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

// Get the external database URL
function getExternalDatabaseUrl(): string | null {
  let dugguConnectionUrl = process.env.DUGGU_DATABASE_CONNECTION_URL;
  
  if (dugguConnectionUrl) {
    // Clean up the connection URL - remove any psql command prefixes
    if (dugguConnectionUrl.includes("'postgresql://")) {
      dugguConnectionUrl = dugguConnectionUrl.match(/'(postgresql:\/\/[^']+)'/)?.[1] || dugguConnectionUrl;
    } else if (dugguConnectionUrl.includes('"postgresql://')) {
      dugguConnectionUrl = dugguConnectionUrl.match(/"(postgresql:\/\/[^"]+)"/)?.[1] || dugguConnectionUrl;
    }
    
    if (dugguConnectionUrl.startsWith('postgresql://') || dugguConnectionUrl.startsWith('postgres://')) {
      return dugguConnectionUrl;
    }
  }
  
  return null;
}

// Lazy-load the connection pool only when needed
let externalReadOnlyPool: Pool | null = null;

function getExternalReadOnlyPool(): Pool {
  if (!externalReadOnlyPool) {
    const url = getExternalDatabaseUrl();
    if (!url) {
      throw new Error('External database connection URL not found. Please configure DUGGU_DATABASE_CONNECTION_URL environment variable.');
    }
    
    externalReadOnlyPool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      max: 5,
      min: 1,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 10000,
      allowExitOnIdle: false,
      query_timeout: 15000,
      statement_timeout: 15000,
    });
  }
  
  return externalReadOnlyPool;
}

// Interface for external contact data
interface ExternalContact {
  id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  email?: string;
  mobile_phone?: string;
  other_phone?: string;
  home_phone?: string;
  corporate_phone?: string;
  company?: string;
  employees?: number;
  employee_size_bracket?: string;
  industry?: string;
  website?: string;
  company_linkedin?: string;
  technologies?: string[];
  annual_revenue?: number;
  person_linkedin?: string;
  city?: string;
  state?: string;
  country?: string;
  company_address?: string;
  company_city?: string;
  company_state?: string;
  company_country?: string;
  email_domain?: string;
  country_code?: string;
  timezone?: string;
  lead_score?: number;
  company_age?: number;
  technology_category?: string;
  region?: string;
  business_type?: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
}

export class ExternalDugguService {
  /**
   * Search contacts in the external database using fuzzy matching
   * @param query Search query string
   * @param limit Maximum number of results to return
   * @returns Array of matching contacts
   */
  async searchContacts(query: string, limit: number = 50): Promise<{ contacts: ExternalContact[], total: number }> {
    try {
      const searchQuery = `%${query.toLowerCase()}%`;
      
      const pool = getExternalReadOnlyPool();
      const result = await pool.query(`
        SELECT * FROM contacts 
        WHERE is_deleted = false 
          AND (
            LOWER(full_name) LIKE $1 OR
            LOWER(first_name) LIKE $1 OR
            LOWER(last_name) LIKE $1 OR
            LOWER(title) LIKE $1 OR
            LOWER(email) LIKE $1 OR
            LOWER(company) LIKE $1 OR
            LOWER(industry) LIKE $1 OR
            LOWER(city) LIKE $1 OR
            LOWER(state) LIKE $1 OR
            LOWER(country) LIKE $1
          )
        ORDER BY 
          CASE 
            WHEN LOWER(full_name) LIKE $1 THEN 1
            WHEN LOWER(company) LIKE $1 THEN 2
            WHEN LOWER(title) LIKE $1 THEN 3
            ELSE 4
          END,
          lead_score DESC NULLS LAST,
          full_name
        LIMIT $2;
      `, [searchQuery, limit]);

      const countResult = await pool.query(`
        SELECT COUNT(*) as count FROM contacts 
        WHERE is_deleted = false 
          AND (
            LOWER(full_name) LIKE $1 OR
            LOWER(first_name) LIKE $1 OR
            LOWER(last_name) LIKE $1 OR
            LOWER(title) LIKE $1 OR
            LOWER(email) LIKE $1 OR
            LOWER(company) LIKE $1 OR
            LOWER(industry) LIKE $1 OR
            LOWER(city) LIKE $1 OR
            LOWER(state) LIKE $1 OR
            LOWER(country) LIKE $1
          );
      `, [searchQuery]);

      return {
        contacts: result.rows,
        total: parseInt(countResult.rows[0].count)
      };
    } catch (error) {
      console.error('Error searching contacts in external database:', error);
      throw new Error('Failed to search contacts');
    }
  }

  /**
   * Get all contacts with pagination
   * @param limit Maximum number of results to return
   * @param offset Number of records to skip
   * @returns Array of contacts
   */
  async getAllContacts(limit: number = 50, offset: number = 0): Promise<{ contacts: ExternalContact[], total: number }> {
    try {
      const pool = getExternalReadOnlyPool();
      const result = await pool.query(`
        SELECT * FROM contacts 
        WHERE is_deleted = false 
        ORDER BY lead_score DESC NULLS LAST, full_name
        LIMIT $1 OFFSET $2;
      `, [limit, offset]);

      const countResult = await pool.query(`
        SELECT COUNT(*) as count FROM contacts WHERE is_deleted = false;
      `);

      return {
        contacts: result.rows,
        total: parseInt(countResult.rows[0].count)
      };
    } catch (error) {
      console.error('Error getting all contacts from external database:', error);
      throw new Error('Failed to get contacts');
    }
  }

  /**
   * Get a specific contact by ID
   * @param id Contact ID
   * @returns Contact or null if not found
   */
  async getContactById(id: string): Promise<ExternalContact | null> {
    try {
      const pool = getExternalReadOnlyPool();
      const result = await pool.query(`
        SELECT * FROM contacts 
        WHERE id = $1 AND is_deleted = false;
      `, [id]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting contact by ID from external database:', error);
      throw new Error('Failed to get contact');
    }
  }

  /**
   * Get contacts by company
   * @param company Company name to search for
   * @param limit Maximum number of results
   * @returns Array of contacts from the company
   */
  async getContactsByCompany(company: string, limit: number = 50): Promise<{ contacts: ExternalContact[], total: number }> {
    try {
      const searchQuery = `%${company.toLowerCase()}%`;
      
      const pool = getExternalReadOnlyPool();
      const result = await pool.query(`
        SELECT * FROM contacts 
        WHERE is_deleted = false AND LOWER(company) LIKE $1
        ORDER BY lead_score DESC NULLS LAST, full_name
        LIMIT $2;
      `, [searchQuery, limit]);

      const countResult = await pool.query(`
        SELECT COUNT(*) as count FROM contacts 
        WHERE is_deleted = false AND LOWER(company) LIKE $1;
      `, [searchQuery]);

      return {
        contacts: result.rows,
        total: parseInt(countResult.rows[0].count)
      };
    } catch (error) {
      console.error('Error getting contacts by company from external database:', error);
      throw new Error('Failed to get contacts by company');
    }
  }

  /**
   * Get contacts by industry
   * @param industry Industry to filter by
   * @param limit Maximum number of results
   * @returns Array of contacts in the industry
   */
  async getContactsByIndustry(industry: string, limit: number = 50): Promise<{ contacts: ExternalContact[], total: number }> {
    try {
      const searchQuery = `%${industry.toLowerCase()}%`;
      
      const pool = getExternalReadOnlyPool();
      const result = await pool.query(`
        SELECT * FROM contacts 
        WHERE is_deleted = false AND LOWER(industry) LIKE $1
        ORDER BY lead_score DESC NULLS LAST, full_name
        LIMIT $2;
      `, [searchQuery, limit]);

      const countResult = await pool.query(`
        SELECT COUNT(*) as count FROM contacts 
        WHERE is_deleted = false AND LOWER(industry) LIKE $1;
      `, [searchQuery]);

      return {
        contacts: result.rows,
        total: parseInt(countResult.rows[0].count)
      };
    } catch (error) {
      console.error('Error getting contacts by industry from external database:', error);
      throw new Error('Failed to get contacts by industry');
    }
  }

  /**
   * Get contact statistics from external database
   * @returns Statistics object
   */
  async getContactStatistics(): Promise<{ total: number, withEmail: number, withPhone: number, withScore: number, avgScore: number }> {
    try {
      const pool = getExternalReadOnlyPool();
      const totalResult = await pool.query(`
        SELECT COUNT(*) as count FROM contacts WHERE is_deleted = false;
      `);

      const emailResult = await pool.query(`
        SELECT COUNT(*) as count FROM contacts WHERE is_deleted = false AND email IS NOT NULL AND email != '';
      `);

      const phoneResult = await pool.query(`
        SELECT COUNT(*) as count FROM contacts 
        WHERE is_deleted = false 
          AND (mobile_phone IS NOT NULL OR other_phone IS NOT NULL OR home_phone IS NOT NULL OR corporate_phone IS NOT NULL);
      `);

      const scoreResult = await pool.query(`
        SELECT 
          COUNT(*) as count_with_score,
          AVG(lead_score) as avg_score
        FROM contacts 
        WHERE is_deleted = false AND lead_score IS NOT NULL;
      `);

      return {
        total: parseInt(totalResult.rows[0].count),
        withEmail: parseInt(emailResult.rows[0].count),
        withPhone: parseInt(phoneResult.rows[0].count),
        withScore: parseInt(scoreResult.rows[0].count_with_score || '0'),
        avgScore: parseFloat(scoreResult.rows[0].avg_score || '0')
      };
    } catch (error) {
      console.error('Error getting contact statistics from external database:', error);
      throw new Error('Failed to get contact statistics');
    }
  }

  /**
   * Get top companies by contact count
   * @param limit Number of companies to return
   * @returns Array of companies with contact counts
   */
  async getTopCompanies(limit: number = 10): Promise<{ company: string, count: number, avgScore: number }[]> {
    try {
      const pool = getExternalReadOnlyPool();
      const result = await pool.query(`
        SELECT 
          company,
          COUNT(*) as count,
          AVG(lead_score) as avg_score
        FROM contacts 
        WHERE is_deleted = false AND company IS NOT NULL AND company != ''
        GROUP BY company
        ORDER BY count DESC, avg_score DESC NULLS LAST
        LIMIT $1;
      `, [limit]);

      return result.rows.map(row => ({
        company: row.company,
        count: parseInt(row.count),
        avgScore: parseFloat(row.avg_score || '0')
      }));
    } catch (error) {
      console.error('Error getting top companies from external database:', error);
      throw new Error('Failed to get top companies');
    }
  }

  /**
   * Get contacts with high lead scores
   * @param minScore Minimum lead score threshold
   * @param limit Maximum number of results
   * @returns Array of high-value contacts
   */
  async getHighValueContacts(minScore: number = 7.0, limit: number = 50): Promise<{ contacts: ExternalContact[], total: number }> {
    try {
      const pool = getExternalReadOnlyPool();
      const result = await pool.query(`
        SELECT * FROM contacts 
        WHERE is_deleted = false AND lead_score >= $1
        ORDER BY lead_score DESC, full_name
        LIMIT $2;
      `, [minScore, limit]);

      const countResult = await pool.query(`
        SELECT COUNT(*) as count FROM contacts 
        WHERE is_deleted = false AND lead_score >= $1;
      `, [minScore]);

      return {
        contacts: result.rows,
        total: parseInt(countResult.rows[0].count)
      };
    } catch (error) {
      console.error('Error getting high-value contacts from external database:', error);
      throw new Error('Failed to get high-value contacts');
    }
  }
}

export const externalDugguService = new ExternalDugguService();