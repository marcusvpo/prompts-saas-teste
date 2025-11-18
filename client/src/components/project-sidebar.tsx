import { Plus, FolderOpen, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SidebarSkeleton } from "@/components/loading-skeleton";
import type { Project, ModuleProgress } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
  moduleProgress: ModuleProgress[];
  isLoading?: boolean;
}

export function ProjectSidebar({
  projects,
  selectedProject,
  onSelectProject,
  onCreateProject,
  moduleProgress,
  isLoading = false,
}: ProjectSidebarProps) {
  const calculateProgress = (projectId: string) => {
    const projectPhases = moduleProgress.filter((p) => p.projectId === projectId);
    const total = 12;
    const completed = projectPhases.filter((p) => p.status === "completed").length;
    return Math.round((completed / total) * 100);
  };

  const getStatusIcon = (projectId: string) => {
    const progress = calculateProgress(projectId);
    if (progress === 100) return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />;
    if (progress > 0) return <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  const selectedProgress = selectedProject ? calculateProgress(selectedProject.id) : 0;

  return (
    <div className="w-[280px] h-full border-r bg-sidebar flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-foreground">
            Projetos
          </h2>
        </div>
        <Button
          onClick={onCreateProject}
          className="w-full justify-start gap-2"
          variant="outline"
          size="sm"
          data-testid="button-create-project"
        >
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {isLoading ? (
            <SidebarSkeleton />
          ) : projects.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-muted-foreground">
                Nenhum projeto criado ainda
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project)}
                className={cn(
                  "w-full text-left p-3 rounded-md transition-all",
                  "hover-elevate active-elevate-2",
                  "flex items-start gap-3",
                  selectedProject?.id === project.id
                    ? "bg-sidebar-accent border border-sidebar-accent-border"
                    : "border border-transparent"
                )}
                data-testid={`button-select-project-${project.id}`}
              >
                <div className="mt-0.5">{getStatusIcon(project.id)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-sidebar-foreground">
                    {project.title}
                  </p>
                  {project.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-2">
                    <Progress
                      value={calculateProgress(project.id)}
                      className="h-1"
                    />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {selectedProject && (
        <>
          <Separator />
          <div className="p-6">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Progresso
              </p>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - selectedProgress / 100)}`}
                    className="text-primary transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-foreground" data-testid="text-progress-percentage">
                    {selectedProgress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
