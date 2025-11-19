import {
  type Project,
  type InsertProject,
  type ModuleProgress,
  type InsertModuleProgress,
  type MasterArtifact,
  type InsertMasterArtifact,
  type Note,
  type InsertNote,
} from "@shared/schema";
import { createClient } from "@supabase/supabase-js";
import { getModules, getAllPhases } from "../shared/framework-utils";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface IStorage {
  getProjects(token?: string): Promise<Project[]>;
  getProject(id: string, token?: string): Promise<Project | undefined>;
  createProject(project: InsertProject, token?: string): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>, token?: string): Promise<Project | undefined>;
  deleteProject(id: string, token?: string): Promise<boolean>;

  getModuleProgress(projectId?: string, token?: string): Promise<ModuleProgress[]>;
  getModuleProgressByPhase(
    projectId: string,
    moduleNumber: number,
    phaseNumber: number,
    token?: string
  ): Promise<ModuleProgress | undefined>;
  createOrUpdateModuleProgress(progress: InsertModuleProgress, token?: string): Promise<ModuleProgress>;
  deleteModuleProgressByProject(projectId: string, token?: string): Promise<boolean>;

  getMasterArtifacts(projectId?: string, token?: string): Promise<MasterArtifact[]>;
  getMasterArtifact(id: string, token?: string): Promise<MasterArtifact | undefined>;
  createMasterArtifact(artifact: InsertMasterArtifact, token?: string): Promise<MasterArtifact>;
  deleteMasterArtifactsByProject(projectId: string, token?: string): Promise<boolean>;

  getNotes(projectId?: string, token?: string): Promise<Note[]>;
  getNote(id: string, token?: string): Promise<Note | undefined>;
  createNote(note: InsertNote, token?: string): Promise<Note>;
  updateNote(id: string, content: string, token?: string): Promise<Note | undefined>;
  deleteNotesByProject(projectId: string, token?: string): Promise<boolean>;

  initializeProjectPhases(projectId: string, token?: string): Promise<void>;
}

export class SupabaseStorage implements IStorage {
  private getClient(token?: string) {
    if (!token) return supabase;
    return createClient(supabaseUrl!, supabaseKey!, {
      global: {
        headers: { Authorization: token },
      },
    });
  }

  async getProjects(token?: string): Promise<Project[]> {
    const { data, error } = await this.getClient(token)
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(this.mapProject);
  }

  async getProject(id: string, token?: string): Promise<Project | undefined> {
    const { data, error } = await this.getClient(token)
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    return this.mapProject(data);
  }

  async createProject(insertProject: InsertProject, token?: string): Promise<Project> {
    const client = this.getClient(token);
    const { data: { user }, error: userError } = await client.auth.getUser();

    if (userError || !user) {
      throw new Error("User must be authenticated to create a project");
    }

    const { data, error } = await client
      .from("projects")
      .insert({
        ...insertProject,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    const project = this.mapProject(data);
    await this.initializeProjectPhases(project.id, token);
    return project;
  }

  async updateProject(
    id: string,
    updates: Partial<InsertProject>,
    token?: string
  ): Promise<Project | undefined> {
    const { data, error } = await this.getClient(token)
      .from("projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) return undefined;
    return this.mapProject(data);
  }

  async deleteProject(id: string, token?: string): Promise<boolean> {
    const { error } = await this.getClient(token).from("projects").delete().eq("id", id);
    return !error;
  }

  async getModuleProgress(projectId?: string, token?: string): Promise<ModuleProgress[]> {
    let query = this.getClient(token).from("module_progress").select("*");
    if (projectId) {
      query = query.eq("project_id", projectId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data.map(this.mapModuleProgress);
  }

  async getModuleProgressByPhase(
    projectId: string,
    moduleNumber: number,
    phaseNumber: number,
    token?: string
  ): Promise<ModuleProgress | undefined> {
    const { data, error } = await this.getClient(token)
      .from("module_progress")
      .select("*")
      .eq("project_id", projectId)
      .eq("module_number", moduleNumber)
      .eq("phase_number", phaseNumber)
      .single();

    if (error) return undefined;
    return this.mapModuleProgress(data);
  }

  async createOrUpdateModuleProgress(
    insertProgress: InsertModuleProgress,
    token?: string
  ): Promise<ModuleProgress> {
    // Check if exists
    const existing = await this.getModuleProgressByPhase(
      insertProgress.projectId,
      insertProgress.moduleNumber,
      insertProgress.phaseNumber,
      token
    );

    let result;
    if (existing) {
      const { data, error } = await this.getClient(token)
        .from("module_progress")
        .update({
          content: insertProgress.content,
          prompt_created: insertProgress.promptCreated,
          status: insertProgress.status || existing.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await this.getClient(token)
        .from("module_progress")
        .insert({
          project_id: insertProgress.projectId,
          module_number: insertProgress.moduleNumber,
          module_title: insertProgress.moduleTitle,
          phase_number: insertProgress.phaseNumber,
          phase_title: insertProgress.phaseTitle,
          content: insertProgress.content,
          prompt_created: insertProgress.promptCreated,
          status: insertProgress.status || "not_started",
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    // Update project timestamp
    await this.getClient(token)
      .from("projects")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", insertProgress.projectId);

    return this.mapModuleProgress(result);
  }

  async deleteModuleProgressByProject(projectId: string, token?: string): Promise<boolean> {
    const { error } = await this.getClient(token)
      .from("module_progress")
      .delete()
      .eq("project_id", projectId);
    return !error;
  }

  async getMasterArtifacts(projectId?: string, token?: string): Promise<MasterArtifact[]> {
    let query = this.getClient(token).from("master_artifacts").select("*");
    if (projectId) {
      query = query.eq("project_id", projectId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data.map(this.mapMasterArtifact);
  }

  async getMasterArtifact(id: string, token?: string): Promise<MasterArtifact | undefined> {
    const { data, error } = await this.getClient(token)
      .from("master_artifacts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    return this.mapMasterArtifact(data);
  }

  async createMasterArtifact(
    insertArtifact: InsertMasterArtifact,
    token?: string
  ): Promise<MasterArtifact> {
    const { data, error } = await this.getClient(token)
      .from("master_artifacts")
      .insert({
        project_id: insertArtifact.projectId,
        artifact_type: insertArtifact.artifactType,
        artifact_content: insertArtifact.artifactContent,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapMasterArtifact(data);
  }

  async deleteMasterArtifactsByProject(projectId: string, token?: string): Promise<boolean> {
    const { error } = await this.getClient(token)
      .from("master_artifacts")
      .delete()
      .eq("project_id", projectId);
    return !error;
  }

  async getNotes(projectId?: string, token?: string): Promise<Note[]> {
    let query = this.getClient(token).from("notes").select("*");
    if (projectId) {
      query = query.eq("project_id", projectId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data.map(this.mapNote);
  }

  async getNote(id: string, token?: string): Promise<Note | undefined> {
    const { data, error } = await this.getClient(token)
      .from("notes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    return this.mapNote(data);
  }

  async createNote(insertNote: InsertNote, token?: string): Promise<Note> {
    const { data, error } = await this.getClient(token)
      .from("notes")
      .insert({
        project_id: insertNote.projectId,
        content: insertNote.content,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapNote(data);
  }

  async updateNote(id: string, content: string, token?: string): Promise<Note | undefined> {
    const { data, error } = await this.getClient(token)
      .from("notes")
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return undefined;
    return this.mapNote(data);
  }

  async deleteNotesByProject(projectId: string, token?: string): Promise<boolean> {
    const { error } = await this.getClient(token).from("notes").delete().eq("project_id", projectId);
    return !error;
  }

  async initializeProjectPhases(projectId: string, token?: string): Promise<void> {
    const modules = getModules();
    const allPhases = getAllPhases();

    const phasesToInsert = allPhases.map((phase) => {
      const module = modules.find((m) => m.numero === phase.moduleNumber);
      return {
        project_id: projectId,
        module_number: phase.moduleNumber,
        module_title: module?.titulo || "",
        phase_number: phase.phaseNumber,
        phase_title: phase.nome,
        status: "not_started",
        content: null,
        prompt_created: null,
      };
    });

    const { error } = await this.getClient(token).from("module_progress").insert(phasesToInsert);
    if (error) console.error("Error initializing phases:", error);
  }

  // Mappers to convert snake_case DB fields to camelCase application fields
  private mapProject(data: any): Project {
    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapModuleProgress(data: any): ModuleProgress {
    return {
      id: data.id,
      projectId: data.project_id,
      moduleNumber: data.module_number,
      moduleTitle: data.module_title,
      phaseNumber: data.phase_number,
      phaseTitle: data.phase_title,
      content: data.content,
      promptCreated: data.prompt_created,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapMasterArtifact(data: any): MasterArtifact {
    return {
      id: data.id,
      projectId: data.project_id,
      artifactType: data.artifact_type,
      artifactContent: data.artifact_content,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapNote(data: any): Note {
    return {
      id: data.id,
      projectId: data.project_id,
      content: data.content,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export const storage = new SupabaseStorage();
