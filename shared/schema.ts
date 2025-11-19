import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const moduleProgress = pgTable("module_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  moduleNumber: integer("module_number").notNull(),
  moduleTitle: text("module_title").notNull(),
  phaseNumber: integer("phase_number").notNull(),
  phaseTitle: text("phase_title").notNull(),
  content: text("content"),
  promptCreated: text("prompt_created"),
  status: text("status").notNull().default("not_started"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const masterArtifacts = pgTable("master_artifacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  artifactType: text("artifact_type").notNull(),
  artifactContent: text("artifact_content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(1, "O título é obrigatório").max(100, "O título deve ter no máximo 100 caracteres"),
  description: z.string().max(500, "A descrição deve ter no máximo 500 caracteres").optional(),
});

export const insertModuleProgressSchema = createInsertSchema(moduleProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMasterArtifactSchema = createInsertSchema(masterArtifacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertModuleProgress = z.infer<typeof insertModuleProgressSchema>;
export type ModuleProgress = typeof moduleProgress.$inferSelect;

export type InsertMasterArtifact = z.infer<typeof insertMasterArtifactSchema>;
export type MasterArtifact = typeof masterArtifacts.$inferSelect;

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export type PhaseStatus = "not_started" | "in_progress" | "completed";

export interface FrameworkPhase {
  id: string;
  nome: string;
  descricao: string;
  prompt_template: string;
  etapas?: Array<{
    etapa: number;
    nome: string;
    instrucao: string;
    constraint?: string;
    output: string;
  }>;
  componentes_saida?: any[];
  foco_areas?: string[];
  metodologia?: string;
  papel_ia?: string;
  tecnica?: string;
}

export interface FrameworkModule {
  numero: number;
  titulo: string;
  foco: string;
  objetivo: string;
  artefato_saida: string;
  descricao: string;
  fases: Record<string, FrameworkPhase>;
}

export interface FrameworkData {
  framework_meta: {
    nome: string;
    versao: string;
    metodologia: string;
    data_criacao: string;
    total_modulos: number;
    descricao: string;
  };
  filosofia_base: {
    vibe_coding: string;
    desenvolvimento_aumentado: string;
    contexto_layering: string;
    risk_mitigation: string;
  };
  modulos: Record<string, FrameworkModule>;
}
