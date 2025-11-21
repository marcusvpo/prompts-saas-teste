import type { ModuleProgress } from "@shared/schema";

export const calculateProgress = (
  projectId: string,
  moduleProgress: ModuleProgress[],
  totalPhases: number
): number => {
  const projectPhases = moduleProgress.filter((p) => p.projectId === projectId);
  const completed = projectPhases.filter((p) => p.status === "completed").length;
  return totalPhases > 0 ? Math.round((completed / totalPhases) * 100) : 0;
};
