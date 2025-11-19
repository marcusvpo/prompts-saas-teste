import type { FrameworkData, FrameworkModule, FrameworkPhase } from "./schema";
import frameworkJsonData from "../attached_assets/schema_framework_1763486881607.json";

const frameworkData = frameworkJsonData as unknown as FrameworkData;

export interface ProcessedPhase extends FrameworkPhase {
  moduleNumber: number;
  phaseNumber: number;
  moduleTitle: string;
}

export function getModules(): FrameworkModule[] {
  const modules = frameworkData.modulos;
  return Object.keys(modules)
    .sort()
    .map((key, index) => ({
      ...modules[key as keyof typeof modules],
      numero: index + 1,
    }));
}

export function getPhasesByModule(moduleNumber: number): ProcessedPhase[] {
  const modules = getModules();
  const module = modules.find((m) => m.numero === moduleNumber);
  if (!module) return [];

  const phases = module.fases;
  return Object.keys(phases).map((key, index) => ({
    ...phases[key as keyof typeof phases],
    id: key,
    moduleNumber,
    phaseNumber: index + 1,
    moduleTitle: module.titulo,
  }));
}

export function getAllPhases(): ProcessedPhase[] {
  const modules = getModules();
  const allPhases: ProcessedPhase[] = [];

  modules.forEach((module, moduleIndex) => {
    const phases = module.fases;
    Object.keys(phases).forEach((key, phaseIndex) => {
      allPhases.push({
        ...phases[key as keyof typeof phases],
        id: key,
        moduleNumber: moduleIndex + 1,
        phaseNumber: phaseIndex + 1,
        moduleTitle: module.titulo,
      });
    });
  });

  return allPhases;
}

export function getPhaseDetails(
  moduleNumber: number,
  phaseNumber: number
): ProcessedPhase | undefined {
  const phases = getPhasesByModule(moduleNumber);
  return phases.find((p) => p.phaseNumber === phaseNumber);
}
