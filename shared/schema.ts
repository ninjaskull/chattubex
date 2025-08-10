import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  encryptedData: text("encrypted_data").notNull(),
  fieldMappings: jsonb("field_mappings").notNull(),
  recordCount: integer("record_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  encryptedContent: text("encrypted_content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  encryptedPath: text("encrypted_path").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  mobile: text("mobile").notNull(),
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pet records table for AI to manage pet information
export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // dog, cat, bird, etc.
  breed: text("breed"),
  age: integer("age"),
  weight: text("weight"),
  gender: text("gender"),
  medicalHistory: jsonb("medical_history").default({}),
  vaccinations: jsonb("vaccinations").default([]),
  allergies: text("allergies").array().default([]),
  medications: jsonb("medications").default([]),
  emergencyContact: jsonb("emergency_contact"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI interaction history for learning and context
export const aiInteractions = pgTable("ai_interactions", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").references(() => pets.id),
  userMessage: text("user_message").notNull(),
  aiResponse: text("ai_response").notNull(),
  intent: text("intent"), // health, nutrition, training, etc.
  confidence: integer("confidence"), // 1-100
  feedback: text("feedback"), // user feedback on response quality
  context: jsonb("context").default({}), // conversation context
  createdAt: timestamp("created_at").defaultNow(),
});

// Pet health records that AI can track and analyze
export const petHealthRecords = pgTable("pet_health_records", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").references(() => pets.id),
  recordType: text("record_type").notNull(), // vaccination, checkup, medication, symptom, etc.
  title: text("title").notNull(),
  description: text("description"),
  veterinarian: text("veterinarian"),
  date: timestamp("date").notNull(),
  nextDueDate: timestamp("next_due_date"),
  cost: text("cost"),
  attachments: text("attachments").array().default([]),
  aiAnalysis: text("ai_analysis"), // AI insights about this record
  createdAt: timestamp("created_at").defaultNow(),
});

// Pet activities and behaviors for AI tracking
export const petActivities = pgTable("pet_activities", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").references(() => pets.id),
  activityType: text("activity_type").notNull(), // walk, play, feeding, training, etc.
  duration: integer("duration"), // in minutes
  intensity: text("intensity"), // low, medium, high
  notes: text("notes"),
  location: text("location"),
  weather: text("weather"),
  aiRecommendations: text("ai_recommendations"),
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Document uploads that AI can analyze
export const petDocuments = pgTable("pet_documents", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").references(() => pets.id),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  documentType: text("document_type").notNull(), // medical, photo, certificate, etc.
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  aiAnalysis: text("ai_analysis"), // AI analysis of document content
  extractedText: text("extracted_text"), // OCR or text extraction
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat sessions for organizing conversations
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  petName: text("pet_name"),
  petType: text("pet_type"),
  title: text("title"), // Auto-generated title for the conversation
  isActive: boolean("is_active").default(true),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Individual chat messages within sessions
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").references(() => chatSessions.sessionId).notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // Store additional info like tokens, processing time, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiInteractionSchema = createInsertSchema(aiInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertPetHealthRecordSchema = createInsertSchema(petHealthRecords).omit({
  id: true,
  createdAt: true,
});

export const insertPetActivitySchema = createInsertSchema(petActivities).omit({
  id: true,
  createdAt: true,
});

export const insertPetDocumentSchema = createInsertSchema(petDocuments).omit({
  id: true,
  createdAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Pet = typeof pets.$inferSelect;
export type InsertPet = z.infer<typeof insertPetSchema>;
export type AiInteraction = typeof aiInteractions.$inferSelect;
export type InsertAiInteraction = z.infer<typeof insertAiInteractionSchema>;
export type PetHealthRecord = typeof petHealthRecords.$inferSelect;
export type InsertPetHealthRecord = z.infer<typeof insertPetHealthRecordSchema>;
export type PetActivity = typeof petActivities.$inferSelect;
export type InsertPetActivity = z.infer<typeof insertPetActivitySchema>;
export type PetDocument = typeof petDocuments.$inferSelect;
export type InsertPetDocument = z.infer<typeof insertPetDocumentSchema>;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
