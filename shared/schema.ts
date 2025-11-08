import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
}, (table) => ({
  expireIdx: index("sessions_expire_idx").on(table.expire),
}));

export const domainHistory = pgTable("domain_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(),
  normalizedUrl: text("normalized_url").notNull(),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
  aiVisibilityScore: integer("ai_visibility_score").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("completed"),
}, (table) => ({
  userDomainsIdx: index("domain_history_user_domains_idx").on(table.userId, table.analyzedAt),
  userUrlCacheIdx: index("domain_history_user_url_cache_idx").on(table.userId, table.normalizedUrl, table.analyzedAt),
}));

export const insertDomainHistorySchema = createInsertSchema(domainHistory).omit({
  id: true,
  analyzedAt: true,
});

export type InsertDomainHistory = z.infer<typeof insertDomainHistorySchema>;
export type DomainHistory = typeof domainHistory.$inferSelect;

export const analysisResults = pgTable("analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domainHistoryId: varchar("domain_history_id").notNull().references(() => domainHistory.id, { onDelete: "cascade" }),
  analysisData: jsonb("analysis_data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResultRow = typeof analysisResults.$inferSelect;

// Analysis Result Schema
export const analysisResultSchema = z.object({
  url: z.string().url(),
  brandInfo: z.object({
    name: z.string(),
    domain: z.string(),
    industry: z.string().optional(),
    description: z.string().optional(),
  }),
  overallScore: z.number().min(0).max(100),
  platformScores: z.array(z.object({
    platform: z.string(),
    score: z.number().min(0).max(100),
    color: z.string(),
  })),
  dimensionScores: z.array(z.object({
    dimension: z.string(),
    score: z.number().min(0).max(100),
    fullMark: z.number(),
  })),
  competitors: z.array(z.object({
    rank: z.number(),
    name: z.string(),
    domain: z.string(),
    score: z.number().min(0).max(100),
    marketOverlap: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    isCurrentBrand: z.boolean().optional(),
    funding: z.number().optional(),
    employees: z.number().optional(),
    founded: z.number().optional(),
    description: z.string().optional(),
  })),
  gaps: z.array(z.object({
    element: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
    found: z.boolean(),
  })),
  recommendations: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    category: z.enum(['content', 'technical', 'seo', 'competitive']),
    actionItems: z.array(z.string()),
    estimatedImpact: z.string(),
  })),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
