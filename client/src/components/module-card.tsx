import { ChevronDown, ChevronRight, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { FrameworkModule } from "@shared/schema";
import type { PhaseStatus } from "@shared/schema";
import { getPhasesByModule } from "@/lib/framework-data";
import { useState } from "react";

interface ModuleCardProps {
  module: FrameworkModule;
  moduleNumber: number;
  phaseStatuses: Record<string, PhaseStatus>;
  onPhaseClick: (moduleNumber: number, phaseNumber: number) => void;
}

export function ModuleCard({ module, moduleNumber, phaseStatuses, onPhaseClick }: ModuleCardProps) {
  const [isOpen, setIsOpen] = useState(moduleNumber === 1);
  const phases = getPhasesByModule(moduleNumber);

  const getModuleStatus = (): PhaseStatus => {
    const allCompleted = phases.every((phase) => {
      const key = `${moduleNumber}-${phase.phaseNumber}`;
      return phaseStatuses[key] === "completed";
    });
    if (allCompleted) return "completed";

    const anyInProgress = phases.some((phase) => {
      const key = `${moduleNumber}-${phase.phaseNumber}`;
      return phaseStatuses[key] === "in_progress";
    });
    if (anyInProgress) return "in_progress";

    return "not_started";
  };

  const getStatusBadge = (status: PhaseStatus) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completo
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
            <Loader2 className="h-3 w-3 mr-1" />
            Em Progresso
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Circle className="h-3 w-3 mr-1" />
            Não Iniciado
          </Badge>
        );
    }
  };

  const getPhaseStatusIcon = (status: PhaseStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />;
      case "in_progress":
        return <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const moduleStatus = getModuleStatus();
  const borderColors = [
    "border-l-blue-600 dark:border-l-blue-500",
    "border-l-purple-600 dark:border-l-purple-500",
    "border-l-orange-600 dark:border-l-orange-500",
    "border-l-green-600 dark:border-l-green-500",
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          "bg-card border border-card-border rounded-lg overflow-hidden mb-8",
          "border-l-4",
          borderColors[moduleNumber - 1]
        )}
      >
        <CollapsibleTrigger className="w-full" data-testid={`button-toggle-module-${moduleNumber}`}>
          <div className="p-6 flex items-start justify-between hover-elevate active-elevate-2 transition-all">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold text-lg flex-shrink-0">
                {moduleNumber}
              </div>
              <div className="text-left flex-1">
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  {module.titulo}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {module.descricao}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-muted-foreground">Foco:</span>
                    <span className="text-foreground">{module.foco}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-muted-foreground">Artefato:</span>
                    <span className="text-foreground">{module.artefato_saida}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              {getStatusBadge(moduleStatus)}
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-6 pb-4">
            <div className="space-y-2 mt-4">
              {phases.map((phase) => {
                const key = `${moduleNumber}-${phase.phaseNumber}`;
                const status = phaseStatuses[key] || "not_started";

                return (
                  <button
                    key={phase.id}
                    onClick={() => onPhaseClick(moduleNumber, phase.phaseNumber)}
                    className={cn(
                      "w-full text-left p-4 rounded-md border-l-2 transition-all",
                      "hover-elevate active-elevate-2",
                      "flex items-center gap-3",
                      status === "completed"
                        ? "border-l-green-500 bg-green-50/50 dark:bg-green-950/20"
                        : status === "in_progress"
                        ? "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                        : "border-l-muted bg-muted/30"
                    )}
                    data-testid={`button-phase-${moduleNumber}-${phase.phaseNumber}`}
                  >
                    {getPhaseStatusIcon(status)}
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">
                        Fase {phase.phaseNumber}: {phase.nome}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {phase.descricao}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
