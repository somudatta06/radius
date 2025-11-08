import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
