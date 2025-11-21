import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertModuleProgressSchema, insertMasterArtifactSchema, insertNoteSchema } from "@shared/schema";
import { getModules, getPhasesByModule } from "../shared/framework-utils";

import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply rate limiting to all api routes
  app.use("/api", limiter);

  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects(req.headers.authorization);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id, req.headers.authorization);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData, req.headers.authorization);
      res.status(201).json(project);
    } catch (error: any) {
      console.error("Error creating project:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = (error as any).details || (error as any).hint || (error as any).code;
      res.status(500).json({ error: "Failed to create project", message: errorMessage, details: errorDetails });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, validatedData, req.headers.authorization);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      console.error("Error updating project:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id, req.headers.authorization);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  app.get("/api/module-progress", async (req, res) => {
    try {
      const projectId = req.query.projectId as string | undefined;
      const progress = await storage.getModuleProgress(projectId, req.headers.authorization);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching module progress:", error);
      res.status(500).json({ error: "Failed to fetch module progress" });
    }
  });

  app.post("/api/module-progress", async (req, res) => {
    try {
      const { projectId, moduleNumber, phaseNumber, content } = req.body;

      if (!projectId || !moduleNumber || !phaseNumber) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existingProgress = await storage.getModuleProgressByPhase(
        projectId,
        moduleNumber,
        phaseNumber,
        req.headers.authorization
      );

      const module = getModules().find((m) => m.numero === moduleNumber);
      const phase = getPhasesByModule(moduleNumber).find((p) => p.phaseNumber === phaseNumber);

      if (!module || !phase) {
        return res.status(400).json({ error: "Invalid module or phase number" });
      }

      const status = content && content.trim().length > 0 ? "completed" : existingProgress?.status || "in_progress";

      const progressData = {
        projectId,
        moduleNumber,
        moduleTitle: module.titulo,
        phaseNumber,
        phaseTitle: phase.nome,
        content: content || null,
        promptCreated: null,
        status,
      };

      const validatedData = insertModuleProgressSchema.parse(progressData);
      const progress = await storage.createOrUpdateModuleProgress(validatedData, req.headers.authorization);
      res.json(progress);
    } catch (error: any) {
      console.error("Error updating module progress:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid progress data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update module progress" });
    }
  });

  app.get("/api/master-artifacts", async (req, res) => {
    try {
      const projectId = req.query.projectId as string | undefined;
      const artifacts = await storage.getMasterArtifacts(projectId, req.headers.authorization);
      res.json(artifacts);
    } catch (error) {
      console.error("Error fetching master artifacts:", error);
      res.status(500).json({ error: "Failed to fetch master artifacts" });
    }
  });

  app.post("/api/master-artifacts", async (req, res) => {
    try {
      const validatedData = insertMasterArtifactSchema.parse(req.body);
      const artifact = await storage.createMasterArtifact(validatedData, req.headers.authorization);
      res.status(201).json(artifact);
    } catch (error: any) {
      console.error("Error creating master artifact:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid artifact data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create master artifact" });
    }
  });

  app.get("/api/notes", async (req, res) => {
    try {
      const projectId = req.query.projectId as string | undefined;
      const notes = await storage.getNotes(projectId, req.headers.authorization);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(validatedData, req.headers.authorization);
      res.status(201).json(note);
    } catch (error: any) {
      console.error("Error creating note:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid note data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
    try {
      const { content } = req.body;
      if (typeof content !== "string") {
        return res.status(400).json({ error: "Invalid note content" });
      }
      const note = await storage.updateNote(req.params.id, content, req.headers.authorization);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  app.get("/api/framework/modules", async (_req, res) => {
    try {
      const modules = getModules();
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ error: "Failed to fetch modules" });
    }
  });

  app.get("/api/framework/modules/:moduleNumber/phases", async (req, res) => {
    try {
      const moduleNumber = parseInt(req.params.moduleNumber);
      if (isNaN(moduleNumber)) {
        return res.status(400).json({ error: "Invalid module number" });
      }
      const phases = getPhasesByModule(moduleNumber);
      res.json(phases);
    } catch (error) {
      console.error("Error fetching phases:", error);
      res.status(500).json({ error: "Failed to fetch phases" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
