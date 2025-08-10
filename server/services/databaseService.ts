import { db } from "../db";
import { 
  pets, aiInteractions, petHealthRecords, petActivities, petDocuments, 
  campaigns, notes, documents, contacts, users,
  InsertPet, InsertAiInteraction, InsertPetHealthRecord, 
  InsertPetActivity, InsertPetDocument, Pet, AiInteraction,
  PetHealthRecord, PetActivity, PetDocument,
  chatSessions, chatMessages,
  InsertChatSession, InsertChatMessage,
  ChatSession, ChatMessage
} from "@shared/schema";
import { eq, desc, asc, like, and, or, gte, lte, sql } from "drizzle-orm";

export class DatabaseService {
  
  // Pet management methods
  async createPet(petData: InsertPet): Promise<Pet> {
    const [pet] = await db.insert(pets).values(petData).returning();
    return pet;
  }

  async getPetById(id: number): Promise<Pet | null> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet || null;
  }

  async getPetByName(name: string): Promise<Pet | null> {
    const [pet] = await db.select().from(pets).where(eq(pets.name, name));
    return pet || null;
  }

  async getAllPets(): Promise<Pet[]> {
    return await db.select().from(pets).orderBy(asc(pets.name));
  }

  async updatePet(id: number, updates: Partial<InsertPet>): Promise<Pet | null> {
    const [updatedPet] = await db
      .update(pets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pets.id, id))
      .returning();
    return updatedPet || null;
  }

  async deletePet(id: number): Promise<boolean> {
    const result = await db.delete(pets).where(eq(pets.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchPets(searchTerm: string): Promise<Pet[]> {
    return await db
      .select()
      .from(pets)
      .where(
        or(
          like(pets.name, `%${searchTerm}%`),
          like(pets.type, `%${searchTerm}%`),
          like(pets.breed, `%${searchTerm}%`),
          like(pets.notes, `%${searchTerm}%`)
        )
      );
  }

  // AI Interaction tracking
  async logAiInteraction(interaction: InsertAiInteraction): Promise<AiInteraction> {
    const [logged] = await db.insert(aiInteractions).values(interaction).returning();
    return logged;
  }

  async getAiInteractionHistory(petId?: number, limit: number = 50): Promise<AiInteraction[]> {
    const query = db.select().from(aiInteractions);
    
    if (petId) {
      query.where(eq(aiInteractions.petId, petId));
    }
    
    return await query
      .orderBy(desc(aiInteractions.createdAt))
      .limit(limit);
  }

  async getAiInteractionsByIntent(intent: string, limit: number = 20): Promise<AiInteraction[]> {
    return await db
      .select()
      .from(aiInteractions)
      .where(eq(aiInteractions.intent, intent))
      .orderBy(desc(aiInteractions.createdAt))
      .limit(limit);
  }

  async updateAiInteractionFeedback(id: number, feedback: string): Promise<boolean> {
    const result = await db
      .update(aiInteractions)
      .set({ feedback })
      .where(eq(aiInteractions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Pet Health Records
  async addHealthRecord(record: InsertPetHealthRecord): Promise<PetHealthRecord> {
    const [created] = await db.insert(petHealthRecords).values(record).returning();
    return created;
  }

  async getPetHealthRecords(petId: number): Promise<PetHealthRecord[]> {
    return await db
      .select()
      .from(petHealthRecords)
      .where(eq(petHealthRecords.petId, petId))
      .orderBy(desc(petHealthRecords.date));
  }

  async getUpcomingHealthEvents(petId?: number): Promise<PetHealthRecord[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const query = db
      .select()
      .from(petHealthRecords)
      .where(
        and(
          gte(petHealthRecords.nextDueDate, tomorrow),
          petId ? eq(petHealthRecords.petId, petId) : sql`true`
        )
      )
      .orderBy(asc(petHealthRecords.nextDueDate));

    return await query;
  }

  async updateHealthRecord(id: number, updates: Partial<InsertPetHealthRecord>): Promise<PetHealthRecord | null> {
    const [updated] = await db
      .update(petHealthRecords)
      .set(updates)
      .where(eq(petHealthRecords.id, id))
      .returning();
    return updated || null;
  }

  async searchHealthRecords(searchTerm: string, petId?: number): Promise<PetHealthRecord[]> {
    const baseCondition = or(
      like(petHealthRecords.title, `%${searchTerm}%`),
      like(petHealthRecords.description, `%${searchTerm}%`),
      like(petHealthRecords.recordType, `%${searchTerm}%`),
      like(petHealthRecords.veterinarian, `%${searchTerm}%`)
    );

    const condition = petId 
      ? and(baseCondition, eq(petHealthRecords.petId, petId))
      : baseCondition;

    return await db
      .select()
      .from(petHealthRecords)
      .where(condition)
      .orderBy(desc(petHealthRecords.date));
  }

  // Pet Activities
  async logActivity(activity: InsertPetActivity): Promise<PetActivity> {
    const [logged] = await db.insert(petActivities).values(activity).returning();
    return logged;
  }

  async getPetActivities(petId: number, days: number = 30): Promise<PetActivity[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await db
      .select()
      .from(petActivities)
      .where(
        and(
          eq(petActivities.petId, petId),
          gte(petActivities.date, cutoffDate)
        )
      )
      .orderBy(desc(petActivities.date));
  }

  async getActivityStats(petId: number, activityType?: string): Promise<{
    totalActivities: number;
    totalDuration: number;
    averageDuration: number;
    lastActivity: Date | null;
  }> {
    const conditions = [eq(petActivities.petId, petId)];
    if (activityType) {
      conditions.push(eq(petActivities.activityType, activityType));
    }

    const stats = await db
      .select({
        count: sql<number>`count(*)`,
        totalDuration: sql<number>`coalesce(sum(${petActivities.duration}), 0)`,
        avgDuration: sql<number>`coalesce(avg(${petActivities.duration}), 0)`,
        lastActivity: sql<Date>`max(${petActivities.date})`
      })
      .from(petActivities)
      .where(and(...conditions));

    const result = stats[0];
    return {
      totalActivities: result.count,
      totalDuration: result.totalDuration,
      averageDuration: Math.round(result.avgDuration),
      lastActivity: result.lastActivity
    };
  }

  // Document Management
  async uploadPetDocument(document: InsertPetDocument): Promise<PetDocument> {
    const [uploaded] = await db.insert(petDocuments).values(document).returning();
    return uploaded;
  }

  async getPetDocuments(petId: number, documentType?: string): Promise<PetDocument[]> {
    const conditions = [eq(petDocuments.petId, petId)];
    if (documentType) {
      conditions.push(eq(petDocuments.documentType, documentType));
    }

    return await db
      .select()
      .from(petDocuments)
      .where(and(...conditions))
      .orderBy(desc(petDocuments.createdAt));
  }

  async analyzeDocument(id: number, analysis: string): Promise<boolean> {
    const result = await db
      .update(petDocuments)
      .set({ aiAnalysis: analysis })
      .where(eq(petDocuments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchDocuments(searchTerm: string, petId?: number): Promise<PetDocument[]> {
    const baseCondition = or(
      like(petDocuments.originalName, `%${searchTerm}%`),
      like(petDocuments.documentType, `%${searchTerm}%`),
      like(petDocuments.aiAnalysis, `%${searchTerm}%`),
      like(petDocuments.extractedText, `%${searchTerm}%`)
    );

    const condition = petId 
      ? and(baseCondition, eq(petDocuments.petId, petId))
      : baseCondition;

    return await db
      .select()
      .from(petDocuments)
      .where(condition)
      .orderBy(desc(petDocuments.createdAt));
  }

  // General database operations for existing tables
  async searchAllTables(searchTerm: string): Promise<{
    pets: Pet[];
    healthRecords: PetHealthRecord[];
    activities: PetActivity[];
    documents: PetDocument[];
    interactions: AiInteraction[];
  }> {
    const [
      petResults,
      healthResults, 
      activityResults,
      documentResults,
      interactionResults
    ] = await Promise.all([
      this.searchPets(searchTerm),
      this.searchHealthRecords(searchTerm),
      this.getPetActivities(0, 365).then(activities => 
        activities.filter(a => 
          a.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.activityType.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ),
      this.searchDocuments(searchTerm),
      db.select().from(aiInteractions)
        .where(
          or(
            like(aiInteractions.userMessage, `%${searchTerm}%`),
            like(aiInteractions.aiResponse, `%${searchTerm}%`),
            like(aiInteractions.intent, `%${searchTerm}%`)
          )
        )
        .limit(50)
    ]);

    return {
      pets: petResults,
      healthRecords: healthResults,
      activities: activityResults,
      documents: documentResults,
      interactions: interactionResults
    };
  }

  // Analytics and insights
  async getPetInsights(petId: number): Promise<{
    totalInteractions: number;
    commonTopics: Array<{ intent: string; count: number }>;
    recentActivity: PetActivity[];
    upcomingHealthEvents: PetHealthRecord[];
    healthSummary: {
      totalRecords: number;
      lastCheckup: Date | null;
      nextVaccination: Date | null;
    };
  }> {
    const [
      interactionCount,
      topicStats,
      recentActivities,
      upcomingEvents,
      healthSummary
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(aiInteractions)
        .where(eq(aiInteractions.petId, petId)),
      
      db.select({
        intent: aiInteractions.intent,
        count: sql<number>`count(*)`
      })
        .from(aiInteractions)
        .where(eq(aiInteractions.petId, petId))
        .groupBy(aiInteractions.intent)
        .orderBy(desc(sql`count(*)`))
        .limit(5),
      
      this.getPetActivities(petId, 7),
      this.getUpcomingHealthEvents(petId),
      
      db.select({
        count: sql<number>`count(*)`,
        lastCheckup: sql<Date>`max(case when record_type = 'checkup' then date end)`,
        nextVaccination: sql<Date>`min(case when record_type = 'vaccination' then next_due_date end)`
      })
        .from(petHealthRecords)
        .where(eq(petHealthRecords.petId, petId))
    ]);

    return {
      totalInteractions: interactionCount[0]?.count || 0,
      commonTopics: topicStats.filter(t => t.intent).map(t => ({
        intent: t.intent!,
        count: t.count
      })),
      recentActivity: recentActivities,
      upcomingHealthEvents: upcomingEvents,
      healthSummary: {
        totalRecords: healthSummary[0]?.count || 0,
        lastCheckup: healthSummary[0]?.lastCheckup || null,
        nextVaccination: healthSummary[0]?.nextVaccination || null
      }
    };
  }

  // Backup and export functionality
  async exportPetData(petId: number): Promise<{
    pet: Pet;
    healthRecords: PetHealthRecord[];
    activities: PetActivity[];
    documents: PetDocument[];
    interactions: AiInteraction[];
  }> {
    const [pet, healthRecords, activities, documents, interactions] = await Promise.all([
      this.getPetById(petId),
      this.getPetHealthRecords(petId),
      this.getPetActivities(petId, 365),
      this.getPetDocuments(petId),
      this.getAiInteractionHistory(petId)
    ]);

    if (!pet) {
      throw new Error(`Pet with ID ${petId} not found`);
    }

    return {
      pet,
      healthRecords,
      activities,
      documents,
      interactions
    };
  }
  // Chat History Management
  async createChatSession(sessionData: InsertChatSession): Promise<ChatSession> {
    const [session] = await db.insert(chatSessions).values(sessionData).returning();
    return session;
  }

  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, sessionId));
    return session || null;
  }

  async updateChatSession(sessionId: string, updates: Partial<InsertChatSession>): Promise<ChatSession | null> {
    const [updatedSession] = await db
      .update(chatSessions)
      .set({ ...updates, lastMessageAt: new Date() })
      .where(eq(chatSessions.sessionId, sessionId))
      .returning();
    return updatedSession || null;
  }

  async getChatSessions(limit: number = 50): Promise<ChatSession[]> {
    return await db.select()
      .from(chatSessions)
      .orderBy(desc(chatSessions.lastMessageAt))
      .limit(limit);
  }

  async saveChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    // Update session's last message time
    await db
      .update(chatSessions)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatSessions.sessionId, messageData.sessionId));

    const [message] = await db.insert(chatMessages).values(messageData).returning();
    return message;
  }

  async getChatHistory(sessionId: string, limit: number = 100): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(limit);
  }

  async searchChatHistory(searchTerm: string, sessionId?: string): Promise<ChatMessage[]> {
    const baseCondition = like(chatMessages.content, `%${searchTerm}%`);
    const condition = sessionId 
      ? and(baseCondition, eq(chatMessages.sessionId, sessionId))
      : baseCondition;

    return await db.select()
      .from(chatMessages)
      .where(condition)
      .orderBy(desc(chatMessages.createdAt))
      .limit(50);
  }

  async deleteChatSession(sessionId: string): Promise<boolean> {
    // Delete messages first (referential integrity)
    await db.delete(chatMessages).where(eq(chatMessages.sessionId, sessionId));
    
    // Then delete session
    const result = await db.delete(chatSessions).where(eq(chatSessions.sessionId, sessionId));
    return (result.rowCount ?? 0) > 0;
  }

  async generateSessionTitle(sessionId: string): Promise<string> {
    const messages = await this.getChatHistory(sessionId, 5);
    if (messages.length === 0) return "New Conversation";

    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return "New Conversation";

    // Extract key topics from first user message for title
    const firstMessage = userMessages[0].content;
    const words = firstMessage.split(' ').slice(0, 6);
    return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '');
  }

}

export const databaseService = new DatabaseService();