import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";
import type { MasterArtifact, InsertMasterArtifact } from "@shared/schema";

/**
 * Hook to fetch all master artifacts
 */
export function useMasterArtifacts() {
  return useQuery<MasterArtifact[]>({
    queryKey: ["/api/master-artifacts"],
  });
}

/**
 * Hook to fetch master artifacts for a specific project
 */
export function useProjectMasterArtifacts(projectId: string | null) {
  return useQuery<MasterArtifact[]>({
    queryKey: ["/api/master-artifacts", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await fetch(`/api/master-artifacts?projectId=${projectId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch master artifacts");
      }
      return await res.json();
    },
    enabled: !!projectId,
  });
}

/**
 * Hook to create a new master artifact
 */
export function useCreateMasterArtifact() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertMasterArtifact) => {
      const res = await apiRequest("POST", "/api/master-artifacts", data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-artifacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/master-artifacts", variables.projectId] });
      toast({
        title: "Artefato criado",
        description: "O artefato mestre foi criado com sucesso.",
      });
      logger.info("Master artifact created successfully");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar artefato",
        description: error.message || "Não foi possível criar o artefato.",
        variant: "destructive",
      });
      logger.error("Failed to create master artifact", error);
    },
  });
}

/**
 * Hook to update a master artifact
 */
export function useUpdateMasterArtifact() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertMasterArtifact> }) => {
      const res = await apiRequest("PATCH", `/api/master-artifacts/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-artifacts"] });
      toast({
        title: "Artefato atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      logger.info("Master artifact updated successfully");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar artefato",
        description: error.message || "Não foi possível atualizar o artefato.",
        variant: "destructive",
      });
      logger.error("Failed to update master artifact", error);
    },
  });
}
