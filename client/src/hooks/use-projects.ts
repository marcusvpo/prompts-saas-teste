import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";
import type { Project, InsertProject, ProjectWithProgress } from "@shared/schema";

/**
 * Hook to fetch all projects with their module progress
 */
export function useProjects() {
  return useQuery<ProjectWithProgress[]>({
    queryKey: ["/api/projects"],
  });
}

/**
 * Hook to fetch a single project by ID
 */
export function useProject(projectId: string | null) {
  return useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertProject) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Projeto criado",
        description: "O projeto foi criado com sucesso.",
      });
      logger.info("Project created successfully");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar projeto",
        description: error.message || "Não foi possível criar o projeto.",
        variant: "destructive",
      });
      logger.error("Failed to create project", error);
    },
  });
}

/**
 * Hook to update an existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProject> }) => {
      const res = await apiRequest("PATCH", `/api/projects/${id}`, data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", variables.id] });
      toast({
        title: "Projeto atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      logger.info("Project updated successfully", { projectId: variables.id });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar projeto",
        description: error.message || "Não foi possível atualizar o projeto.",
        variant: "destructive",
      });
      logger.error("Failed to update project", error);
    },
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const res = await apiRequest("DELETE", `/api/projects/${projectId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Projeto excluído",
        description: "O projeto foi excluído com sucesso.",
      });
      logger.info("Project deleted successfully");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir projeto",
        description: error.message || "Não foi possível excluir o projeto.",
        variant: "destructive",
      });
      logger.error("Failed to delete project", error);
    },
  });
}
