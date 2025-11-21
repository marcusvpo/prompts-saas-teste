import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";
import type { ModuleProgress, InsertModuleProgress } from "@shared/schema";

/**
 * Hook to fetch module progress for a specific project
 */
export function useModuleProgress(projectId: string | null) {
  return useQuery<ModuleProgress[]>({
    queryKey: ["/api/module-progress", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await fetch(`/api/module-progress?projectId=${projectId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch module progress");
      }
      return await res.json();
    },
    enabled: !!projectId,
  });
}

/**
 * Hook to update or create module progress
 */
export function useUpdateModuleProgress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertModuleProgress) => {
      const res = await apiRequest("POST", "/api/module-progress", data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate both the specific project's progress and all projects
      queryClient.invalidateQueries({ queryKey: ["/api/module-progress", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      logger.info("Module progress updated successfully", {
        projectId: variables.projectId,
        moduleNumber: variables.moduleNumber,
        phaseNumber: variables.phaseNumber,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar progresso",
        description: error.message || "Não foi possível salvar o progresso.",
        variant: "destructive",
      });
      logger.error("Failed to update module progress", error);
    },
  });
}
