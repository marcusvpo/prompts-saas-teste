import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProjects, useCreateProject, useDeleteProject } from "../use-projects";
import type { ReactNode } from "react";

// Create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useProjects", () => {
  it("should fetch projects successfully", async () => {
    const mockProjects = [
      {
        id: "1",
        title: "Test Project",
        description: "Test Description",
        createdAt: new Date(),
        updatedAt: new Date(),
        moduleProgress: [],
      },
    ];

    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProjects),
      } as Response)
    );

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockProjects);
  });

  it("should handle fetch error", async () => {
    // Mock fetch to fail
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        statusText: "Internal Server Error",
        text: () => Promise.resolve("Error"),
      } as Response)
    );

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useCreateProject", () => {
  it("should create project successfully", async () => {
    const mockProject = {
      id: "1",
      title: "New Project",
      description: "New Description",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProject),
      } as Response)
    );

    const { result } = renderHook(() => useCreateProject(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      title: "New Project",
      description: "New Description",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
