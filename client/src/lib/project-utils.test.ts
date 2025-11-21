import { describe, it, expect } from "vitest";
import { calculateProgress } from "./project-utils";
import type { ModuleProgress } from "@shared/schema";

describe("calculateProgress", () => {
  it("should return 0 if no phases are completed", () => {
    const progress: ModuleProgress[] = [];
    const result = calculateProgress("1", progress, 10);
    expect(result).toBe(0);
  });

  it("should return 100 if all phases are completed", () => {
    const progress: ModuleProgress[] = Array(10).fill(null).map((_, i) => ({
      id: `id-${i}`,
      projectId: "1",
      moduleNumber: 1,
      moduleTitle: "Module",
      phaseNumber: i + 1,
      phaseTitle: "Phase",
      status: "completed",
      content: null,
      promptCreated: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const result = calculateProgress("1", progress, 10);
    expect(result).toBe(100);
  });

  it("should return 50 if half phases are completed", () => {
    const progress: ModuleProgress[] = Array(5).fill(null).map((_, i) => ({
      id: `id-${i}`,
      projectId: "1",
      moduleNumber: 1,
      moduleTitle: "Module",
      phaseNumber: i + 1,
      phaseTitle: "Phase",
      status: "completed",
      content: null,
      promptCreated: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const result = calculateProgress("1", progress, 10);
    expect(result).toBe(50);
  });

  it("should ignore progress from other projects", () => {
    const progress: ModuleProgress[] = [
      {
        id: "1",
        projectId: "2", // Different project
        moduleNumber: 1,
        moduleTitle: "Module",
        phaseNumber: 1,
        phaseTitle: "Phase",
        status: "completed",
        content: null,
        promptCreated: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const result = calculateProgress("1", progress, 10);
    expect(result).toBe(0);
  });
});
