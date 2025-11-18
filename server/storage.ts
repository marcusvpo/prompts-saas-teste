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
import { randomUUID } from "crypto";
import { getModules, getAllPhases } from "../shared/framework-utils";

export interface IStorage {
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  getModuleProgress(projectId?: string): Promise<ModuleProgress[]>;
  getModuleProgressByPhase(
    projectId: string,
    moduleNumber: number,
    phaseNumber: number
  ): Promise<ModuleProgress | undefined>;
  createOrUpdateModuleProgress(progress: InsertModuleProgress): Promise<ModuleProgress>;
  deleteModuleProgressByProject(projectId: string): Promise<boolean>;

  getMasterArtifacts(projectId?: string): Promise<MasterArtifact[]>;
  getMasterArtifact(id: string): Promise<MasterArtifact | undefined>;
  createMasterArtifact(artifact: InsertMasterArtifact): Promise<MasterArtifact>;
  deleteMasterArtifactsByProject(projectId: string): Promise<boolean>;

  getNotes(projectId?: string): Promise<Note[]>;
  getNote(id: string): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: string, content: string): Promise<Note | undefined>;
  deleteNotesByProject(projectId: string): Promise<boolean>;

  initializeProjectPhases(projectId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private moduleProgress: Map<string, ModuleProgress>;
  private masterArtifacts: Map<string, MasterArtifact>;
  private notes: Map<string, Note>;

  constructor() {
    this.projects = new Map();
    this.moduleProgress = new Map();
    this.masterArtifacts = new Map();
    this.notes = new Map();
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, project);

    await this.initializeProjectPhases(id);

    return project;
  }

  async updateProject(
    id: string,
    updates: Partial<InsertProject>
  ): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updated: Project = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const deleted = this.projects.delete(id);
    if (deleted) {
      await this.deleteModuleProgressByProject(id);
      await this.deleteMasterArtifactsByProject(id);
      await this.deleteNotesByProject(id);
    }
    return deleted;
  }

  async getModuleProgress(projectId?: string): Promise<ModuleProgress[]> {
    const allProgress = Array.from(this.moduleProgress.values());
    if (projectId) {
      return allProgress.filter((p) => p.projectId === projectId);
    }
    return allProgress;
  }

  async getModuleProgressByPhase(
    projectId: string,
    moduleNumber: number,
    phaseNumber: number
  ): Promise<ModuleProgress | undefined> {
    return Array.from(this.moduleProgress.values()).find(
      (p) =>
        p.projectId === projectId &&
        p.moduleNumber === moduleNumber &&
        p.phaseNumber === phaseNumber
    );
  }

  async createOrUpdateModuleProgress(
    insertProgress: InsertModuleProgress
  ): Promise<ModuleProgress> {
    const existing = await this.getModuleProgressByPhase(
      insertProgress.projectId,
      insertProgress.moduleNumber,
      insertProgress.phaseNumber
    );

    const now = new Date();
    
    if (existing) {
      const updated: ModuleProgress = {
        ...existing,
        content: insertProgress.content,
        promptCreated: insertProgress.promptCreated,
        status: insertProgress.status || existing.status,
        updatedAt: now,
      };
      this.moduleProgress.set(existing.id, updated);

      const project = this.projects.get(insertProgress.projectId);
      if (project) {
        project.updatedAt = now;
        this.projects.set(project.id, project);
      }

      return updated;
    } else {
      const id = randomUUID();
      const progress: ModuleProgress = {
        ...insertProgress,
        id,
        createdAt: now,
        updatedAt: now,
      };
      this.moduleProgress.set(id, progress);

      const project = this.projects.get(insertProgress.projectId);
      if (project) {
        project.updatedAt = now;
        this.projects.set(project.id, project);
      }

      return progress;
    }
  }

  async deleteModuleProgressByProject(projectId: string): Promise<boolean> {
    const toDelete = Array.from(this.moduleProgress.entries()).filter(
      ([_, p]) => p.projectId === projectId
    );
    toDelete.forEach(([id]) => this.moduleProgress.delete(id));
    return toDelete.length > 0;
  }

  async getMasterArtifacts(projectId?: string): Promise<MasterArtifact[]> {
    const allArtifacts = Array.from(this.masterArtifacts.values());
    if (projectId) {
      return allArtifacts.filter((a) => a.projectId === projectId);
    }
    return allArtifacts;
  }

  async getMasterArtifact(id: string): Promise<MasterArtifact | undefined> {
    return this.masterArtifacts.get(id);
  }

  async createMasterArtifact(
    insertArtifact: InsertMasterArtifact
  ): Promise<MasterArtifact> {
    const id = randomUUID();
    const now = new Date();
    const artifact: MasterArtifact = {
      ...insertArtifact,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.masterArtifacts.set(id, artifact);
    return artifact;
  }

  async deleteMasterArtifactsByProject(projectId: string): Promise<boolean> {
    const toDelete = Array.from(this.masterArtifacts.entries()).filter(
      ([_, a]) => a.projectId === projectId
    );
    toDelete.forEach(([id]) => this.masterArtifacts.delete(id));
    return toDelete.length > 0;
  }

  async getNotes(projectId?: string): Promise<Note[]> {
    const allNotes = Array.from(this.notes.values());
    if (projectId) {
      return allNotes.filter((n) => n.projectId === projectId);
    }
    return allNotes;
  }

  async getNote(id: string): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = randomUUID();
    const now = new Date();
    const note: Note = {
      ...insertNote,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: string, content: string): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;

    const updated: Note = {
      ...note,
      content,
      updatedAt: new Date(),
    };
    this.notes.set(id, updated);
    return updated;
  }

  async deleteNotesByProject(projectId: string): Promise<boolean> {
    const toDelete = Array.from(this.notes.entries()).filter(
      ([_, n]) => n.projectId === projectId
    );
    toDelete.forEach(([id]) => this.notes.delete(id));
    return toDelete.length > 0;
  }

  async initializeProjectPhases(projectId: string): Promise<void> {
    const modules = getModules();
    const allPhases = getAllPhases();

    for (const phase of allPhases) {
      const id = randomUUID();
      const now = new Date();
      
      const module = modules.find((m) => m.numero === phase.moduleNumber);
      
      const progress: ModuleProgress = {
        id,
        projectId,
        moduleNumber: phase.moduleNumber,
        moduleTitle: module?.titulo || "",
        phaseNumber: phase.phaseNumber,
        phaseTitle: phase.nome,
        content: null,
        promptCreated: null,
        status: "not_started",
        createdAt: now,
        updatedAt: now,
      };
      
      this.moduleProgress.set(id, progress);
    }
  }
}

export const storage = new MemStorage();
