import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Download, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjectSidebar } from "@/components/project-sidebar";
import { ModuleCard } from "@/components/module-card";
import { PhaseDetailDialog } from "@/components/phase-detail-dialog";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { ExportDialog } from "@/components/export-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoadmapSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getModules, getPhaseDetails } from "@/lib/framework-data";
import type { Project, ModuleProgress, MasterArtifact, InsertProject, PhaseStatus } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<{ moduleNumber: number; phaseNumber: number } | null>(null);

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: moduleProgress = [], isLoading: progressLoading } = useQuery<ModuleProgress[]>({
    queryKey: ["/api/module-progress", selectedProject?.id],
    queryFn: async () => {
      if (!selectedProject) return [];
      const response = await fetch(`/api/module-progress?projectId=${selectedProject.id}`);
      if (!response.ok) throw new Error("Failed to fetch module progress");
      return response.json();
    },
    enabled: !!selectedProject,
  });

  const { data: masterArtifacts = [] } = useQuery<MasterArtifact[]>({
    queryKey: ["/api/master-artifacts", selectedProject?.id],
    queryFn: async () => {
      if (!selectedProject) return [];
      const response = await fetch(`/api/master-artifacts?projectId=${selectedProject.id}`);
      if (!response.ok) throw new Error("Failed to fetch master artifacts");
      return response.json();
    },
    enabled: !!selectedProject,
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: InsertProject) => apiRequest("POST", "/api/projects", data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setCreateDialogOpen(false);
      setSelectedProject(newProject);
      toast({
        title: "Projeto criado!",
        description: `${newProject.title} foi criado com sucesso.`,
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar projeto",
        description: "Não foi possível criar o projeto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ moduleNumber, phaseNumber, content }: { moduleNumber: number; phaseNumber: number; content: string }) => {
      if (!selectedProject) {
        throw new Error("No project selected");
      }
      return apiRequest("POST", "/api/module-progress", {
        projectId: selectedProject.id,
        moduleNumber,
        phaseNumber,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/module-progress", selectedProject?.id] });
    },
  });

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  const modules = getModules();

  const getPhaseStatuses = (): Record<string, PhaseStatus> => {
    const statuses: Record<string, PhaseStatus> = {};
    if (!selectedProject) return statuses;

    const projectProgress = moduleProgress.filter((p) => p.projectId === selectedProject.id);
    projectProgress.forEach((progress) => {
      const key = `${progress.moduleNumber}-${progress.phaseNumber}`;
      statuses[key] = progress.status as PhaseStatus;
    });

    return statuses;
  };

  const handlePhaseClick = (moduleNumber: number, phaseNumber: number) => {
    setSelectedPhase({ moduleNumber, phaseNumber });
  };

  const handleSavePhase = async (moduleNumber: number, phaseNumber: number, content: string): Promise<void> => {
    if (!selectedProject) {
      toast({
        title: "Erro",
        description: "Selecione um projeto antes de salvar.",
        variant: "destructive",
      });
      throw new Error("No project selected");
    }
    
    await updateProgressMutation.mutateAsync({ moduleNumber, phaseNumber, content });
  };

  const phaseStatuses = getPhaseStatuses();
  const currentPhaseDetails = selectedPhase
    ? getPhaseDetails(selectedPhase.moduleNumber, selectedPhase.phaseNumber)
    : null;

  const currentPhaseContent = selectedPhase && selectedProject
    ? moduleProgress.find(
        (p) =>
          p.projectId === selectedProject.id &&
          p.moduleNumber === selectedPhase.moduleNumber &&
          p.phaseNumber === selectedPhase.phaseNumber
      )?.content || ""
    : "";

  return (
    <div className="flex h-screen bg-background">
      <ProjectSidebar
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onCreateProject={() => setCreateDialogOpen(true)}
        moduleProgress={moduleProgress.filter((p) => p.projectId === selectedProject?.id)}
        isLoading={projectsLoading}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-background px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">Framework Vibe Coding</h1>
            </div>
            {selectedProject && (
              <>
                <div className="h-6 w-px bg-border" />
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedProject.title}</p>
                  <p className="text-xs text-muted-foreground">Projeto Selecionado</p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedProject && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExportDialogOpen(true)}
                className="gap-2"
                data-testid="button-export-project"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            )}
            <ThemeToggle />
          </div>
        </header>

        <ScrollArea className="flex-1">
          {selectedProject ? (
            <div className="max-w-4xl mx-auto px-8 py-12">
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                  Roadmap do Framework
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Siga as etapas estruturadas para desenvolver seu projeto com IA de forma profissional e rigorosa.
                </p>
              </div>

              {progressLoading ? (
                <RoadmapSkeleton />
              ) : (
                <div className="space-y-0">
                  {modules.map((module) => (
                    <ModuleCard
                      key={module.numero}
                      module={module}
                      moduleNumber={module.numero}
                      phaseStatuses={phaseStatuses}
                      onPhaseClick={handlePhaseClick}
                    />
                  ))}
                </div>
              )}

              <div className="mt-12 p-6 bg-muted/50 rounded-lg border border-border">
                <h3 className="font-semibold mb-2 text-foreground">
                  Sobre o Framework Mestre de Desenvolvimento Aumentado
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Este framework combina Vibe Coding com rigor profissional, usando Context Layering para manter
                  coerência conforme a complexidade aumenta. Cada módulo gera artefatos que se tornam contexto
                  imutável para o próximo, garantindo alinhamento estratégico e técnico.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md px-8">
                <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2 text-foreground">
                  Bem-vindo ao Framework Vibe Coding
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Crie seu primeiro projeto para começar a estruturar o desenvolvimento com IA de forma profissional.
                </p>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  size="lg"
                  data-testid="button-create-first-project"
                >
                  Criar Primeiro Projeto
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      <CreateProjectDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={(data) => createProjectMutation.mutate(data)}
      />

      <PhaseDetailDialog
        phase={currentPhaseDetails}
        isOpen={!!selectedPhase}
        onClose={() => setSelectedPhase(null)}
        onSave={handleSavePhase}
        initialContent={currentPhaseContent}
        isSavingExternal={updateProgressMutation.isPending}
      />

      <ExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        project={selectedProject}
        moduleProgress={moduleProgress.filter((p) => p.projectId === selectedProject?.id)}
        masterArtifacts={masterArtifacts.filter((a) => a.projectId === selectedProject?.id)}
      />
    </div>
  );
}
