import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";
import type { Note, InsertNote } from "@shared/schema";

/**
 * Hook to fetch notes for a specific project
 */
export function useNotes(projectId: string | null) {
  return useQuery<Note[]>({
    queryKey: ["/api/notes", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await fetch(`/api/notes?projectId=${projectId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch notes");
      }
      return await res.json();
    },
    enabled: !!projectId,
  });
}

/**
 * Hook to create a new note
 */
export function useCreateNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertNote) => {
      const res = await apiRequest("POST", "/api/notes", data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", variables.projectId] });
      toast({
        title: "Nota criada",
        description: "A nota foi criada com sucesso.",
      });
      logger.info("Note created successfully");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar nota",
        description: error.message || "Não foi possível criar a nota.",
        variant: "destructive",
      });
      logger.error("Failed to create note", error);
    },
  });
}

/**
 * Hook to update a note
 */
export function useUpdateNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertNote> }) => {
      const res = await apiRequest("PATCH", `/api/notes/${id}`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", data.projectId] });
      toast({
        title: "Nota atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
      logger.info("Note updated successfully");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar nota",
        description: error.message || "Não foi possível atualizar a nota.",
        variant: "destructive",
      });
      logger.error("Failed to update note", error);
    },
  });
}

/**
 * Hook to delete a note
 */
export function useDeleteNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const res = await apiRequest("DELETE", `/api/notes/${id}`);
      return { ...await res.json(), projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", data.projectId] });
      toast({
        title: "Nota excluída",
        description: "A nota foi excluída com sucesso.",
      });
      logger.info("Note deleted successfully");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir nota",
        description: error.message || "Não foi possível excluir a nota.",
        variant: "destructive",
      });
      logger.error("Failed to delete note", error);
    },
  });
}
