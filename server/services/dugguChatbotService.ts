import { readOnlyDb } from '../db';
import { contacts, campaigns, chatSessions, chatMessages, pets, petHealthRecords, petActivities } from '@shared/schema';
import { sql, ilike, and, or, eq, desc, asc } from 'drizzle-orm';

/**
 * Duggu Chatbot Service - Read-only database operations for AI chatbot
 * This service provides secure, read-only access to the database for the Duggu chatbot
 * All operations are strictly read-only to ensure data integrity
 */
export class DugguChatbotService {
  
  /**
   * Search contacts with fuzzy matching for the chatbot
   * @param query - Search query string
   * @param limit - Maximum number of results (default: 100)
   * @returns Array of matching contacts
   */
  async searchContacts(query: string, limit: number = 100) {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const searchTerm = `%${query.toLowerCase()}%`;
      
      const results = await readOnlyDb
        .select()
        .from(contacts)
        .where(
          or(
            ilike(contacts.name, searchTerm),
            ilike(contacts.email, searchTerm),
            ilike(contacts.mobile, searchTerm)
          )
        )
        .orderBy(desc(contacts.id))
        .limit(limit);

      return results;
    } catch (error) {
      console.error('Error searching contacts for Duggu chatbot:', error);
      throw new Error('Failed to search contacts');
    }
  }

  /**
   * Get contact by ID for the chatbot
   * @param contactId - Contact ID
   * @returns Contact details or null
   */
  async getContactById(contactId: number) {
    try {
      const result = await readOnlyDb
        .select()
        .from(contacts)
        .where(eq(contacts.id, contactId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('Error getting contact by ID for Duggu chatbot:', error);
      throw new Error('Failed to get contact');
    }
  }

  /**
   * Get all contacts for the chatbot
   * @param limit - Maximum number of results
   * @returns Array of all contacts
   */
  async getAllContacts(limit: number = 100) {
    try {
      const results = await readOnlyDb
        .select()
        .from(contacts)
        .orderBy(desc(contacts.id))
        .limit(limit);

      return results;
    } catch (error) {
      console.error('Error getting all contacts for Duggu chatbot:', error);
      throw new Error('Failed to get contacts');
    }
  }

  /**
   * Get pets data for the chatbot (main focus of the application)
   * @param limit - Maximum number of results
   * @returns Array of pets
   */
  async getAllPets(limit: number = 50) {
    try {
      const results = await readOnlyDb
        .select()
        .from(pets)
        .orderBy(desc(pets.createdAt))
        .limit(limit);

      return results;
    } catch (error) {
      console.error('Error getting all pets for Duggu chatbot:', error);
      throw new Error('Failed to get pets');
    }
  }

  /**
   * Search pets by name or type for the chatbot
   * @param query - Search query for pet name or type
   * @param limit - Maximum number of results
   * @returns Array of matching pets
   */
  async searchPets(query: string, limit: number = 50) {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const searchTerm = `%${query.toLowerCase()}%`;
      
      const results = await readOnlyDb
        .select()
        .from(pets)
        .where(
          or(
            ilike(pets.name, searchTerm),
            ilike(pets.type, searchTerm),
            ilike(pets.breed, searchTerm)
          )
        )
        .orderBy(desc(pets.createdAt))
        .limit(limit);

      return results;
    } catch (error) {
      console.error('Error searching pets for Duggu chatbot:', error);
      throw new Error('Failed to search pets');
    }
  }

  /**
   * Get pet by ID for the chatbot
   * @param petId - Pet ID
   * @returns Pet details or null
   */
  async getPetById(petId: number) {
    try {
      const result = await readOnlyDb
        .select()
        .from(pets)
        .where(eq(pets.id, petId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('Error getting pet by ID for Duggu chatbot:', error);
      throw new Error('Failed to get pet');
    }
  }

  /**
   * Get pet health records for the chatbot
   * @param petId - Pet ID (optional)
   * @param limit - Maximum number of results
   * @returns Array of health records
   */
  async getPetHealthRecords(petId?: number, limit: number = 50) {
    try {
      if (petId) {
        const results = await readOnlyDb
          .select()
          .from(petHealthRecords)
          .where(eq(petHealthRecords.petId, petId))
          .orderBy(desc(petHealthRecords.date))
          .limit(limit);
        return results;
      } else {
        const results = await readOnlyDb
          .select()
          .from(petHealthRecords)
          .orderBy(desc(petHealthRecords.date))
          .limit(limit);
        return results;
      }
    } catch (error) {
      console.error('Error getting pet health records for Duggu chatbot:', error);
      throw new Error('Failed to get pet health records');
    }
  }

  /**
   * Get pet activities for the chatbot
   * @param petId - Pet ID (optional)
   * @param limit - Maximum number of results
   * @returns Array of pet activities
   */
  async getPetActivities(petId?: number, limit: number = 50) {
    try {
      if (petId) {
        const results = await readOnlyDb
          .select()
          .from(petActivities)
          .where(eq(petActivities.petId, petId))
          .orderBy(desc(petActivities.date))
          .limit(limit);
        return results;
      } else {
        const results = await readOnlyDb
          .select()
          .from(petActivities)
          .orderBy(desc(petActivities.date))
          .limit(limit);
        return results;
      }
    } catch (error) {
      console.error('Error getting pet activities for Duggu chatbot:', error);
      throw new Error('Failed to get pet activities');
    }
  }

  /**
   * Get chat sessions for the chatbot
   * @param limit - Maximum number of results
   * @returns Array of chat sessions
   */
  async getChatSessions(limit: number = 50) {
    try {
      const results = await readOnlyDb
        .select()
        .from(chatSessions)
        .orderBy(desc(chatSessions.lastMessageAt))
        .limit(limit);

      return results;
    } catch (error) {
      console.error('Error getting chat sessions for Duggu chatbot:', error);
      throw new Error('Failed to get chat sessions');
    }
  }

  /**
   * Get chat messages for a specific session
   * @param sessionId - Session ID
   * @param limit - Maximum number of results
   * @returns Array of chat messages
   */
  async getChatMessages(sessionId: string, limit: number = 100) {
    try {
      const results = await readOnlyDb
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(asc(chatMessages.createdAt))
        .limit(limit);

      return results;
    } catch (error) {
      console.error('Error getting chat messages for Duggu chatbot:', error);
      throw new Error('Failed to get chat messages');
    }
  }

  /**
   * Get campaign information for the chatbot (read-only)
   * @param campaignId - Campaign ID
   * @returns Campaign details or null
   */
  async getCampaignById(campaignId: number) {
    try {
      const result = await readOnlyDb
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, campaignId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('Error getting campaign by ID for Duggu chatbot:', error);
      throw new Error('Failed to get campaign');
    }
  }

  /**
   * Get all campaigns for display in chatbot (read-only)
   * @param limit - Maximum number of results
   * @returns Array of campaigns
   */
  async getAllCampaigns(limit: number = 50) {
    try {
      const results = await readOnlyDb
        .select()
        .from(campaigns)
        .orderBy(desc(campaigns.id))
        .limit(limit);

      return results;
    } catch (error) {
      console.error('Error getting all campaigns for Duggu chatbot:', error);
      throw new Error('Failed to get campaigns');
    }
  }

  /**
   * Get contact statistics for the chatbot
   * @returns Contact statistics object
   */
  async getContactStatistics() {
    try {
      const totalContacts = await readOnlyDb
        .select({ count: sql<number>`count(*)` })
        .from(contacts);

      const sentEmails = await readOnlyDb
        .select({ count: sql<number>`count(*)` })
        .from(contacts)
        .where(eq(contacts.emailSent, true));

      const pendingEmails = await readOnlyDb
        .select({ count: sql<number>`count(*)` })
        .from(contacts)
        .where(eq(contacts.emailSent, false));

      return {
        total: totalContacts[0]?.count || 0,
        sentEmails: sentEmails[0]?.count || 0,
        pendingEmails: pendingEmails[0]?.count || 0
      };
    } catch (error) {
      console.error('Error getting contact statistics for Duggu chatbot:', error);
      throw new Error('Failed to get contact statistics');
    }
  }

  /**
   * Get general statistics for the chatbot dashboard
   * @returns Statistics object with various counts
   */
  async getGeneralStatistics() {
    try {
      const totalPets = await readOnlyDb
        .select({ count: sql<number>`count(*)` })
        .from(pets);

      const totalContacts = await readOnlyDb
        .select({ count: sql<number>`count(*)` })
        .from(contacts);

      const totalCampaigns = await readOnlyDb
        .select({ count: sql<number>`count(*)` })
        .from(campaigns);

      const totalChatSessions = await readOnlyDb
        .select({ count: sql<number>`count(*)` })
        .from(chatSessions);

      return {
        pets: totalPets[0]?.count || 0,
        contacts: totalContacts[0]?.count || 0,
        campaigns: totalCampaigns[0]?.count || 0,
        chatSessions: totalChatSessions[0]?.count || 0
      };
    } catch (error) {
      console.error('Error getting general statistics for Duggu chatbot:', error);
      throw new Error('Failed to get general statistics');
    }
  }
}

// Export singleton instance
export const dugguChatbotService = new DugguChatbotService();